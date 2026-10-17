/**
 * In-app voice calls between two Haraka users (/calls/{callId}).
 *
 * Audio flows directly between the two phones over WebRTC. Firestore is only used to
 * ring the other person and exchange connection details (offer/answer and network
 * candidates), so no call server is needed.
 */
import { addDoc, collection, doc, onSnapshot, query, setDoc, updateDoc, where } from 'firebase/firestore';
import { auth, db } from './firebase';

export type CallStatus = 'ringing' | 'accepted' | 'declined' | 'ended' | 'missed';

export interface CallParty {
  id: string;
  name: string;
  avatar: string;
}

export interface CallDoc {
  id: string;
  callerId: string;
  calleeId: string;
  caller: CallParty;
  callee: CallParty;
  status: CallStatus;
  offer?: { type: RTCSdpType; sdp: string };
  answer?: { type: RTCSdpType; sdp: string };
  createdAtISO: string;
  answeredAtISO?: string;
  endedAtISO?: string;
}

/** What the call screen shows */
export type CallPhase = 'connecting' | 'ringing' | 'connected' | 'ended';

export interface CallEvents {
  onPhase: (phase: CallPhase, message?: string) => void;
}

export interface CallSession {
  callId: string;
  hangUp: () => void;
  setMuted: (muted: boolean) => void;
}

/** Public STUN servers let most phones find each other. A TURN relay can be added here for strict networks. */
const ICE_SERVERS: RTCIceServer[] = [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302'] },
];

/** How long a call rings before it counts as missed */
export const RING_TIMEOUT_MS = 45_000;

const nowISO = () => new Date().toISOString();

export function isInAppCallSupported(): boolean {
  return typeof RTCPeerConnection !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia);
}

async function getMicrophone(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true },
      video: false,
    });
  } catch {
    throw new Error('Allow microphone access to make in-app calls.');
  }
}

/**
 * Shared call plumbing: microphone, peer connection, remote audio, network candidates
 * and watching the call document until it ends.
 */
function createSession(
  callId: string,
  mySide: 'callerCandidates' | 'calleeCandidates',
  local: MediaStream,
  events: CallEvents,
  onCallDoc: (call: CallDoc, pc: RTCPeerConnection) => void
) {
  const callRef = doc(db, 'calls', callId);
  const otherSide = mySide === 'callerCandidates' ? 'calleeCandidates' : 'callerCandidates';
  const pc = new RTCPeerConnection({ iceServers: ICE_SERVERS });
  const remoteAudio = new Audio();
  remoteAudio.autoplay = true;
  const unsubscribers: (() => void)[] = [];
  const pendingCandidates: RTCIceCandidateInit[] = [];
  let finished = false;

  local.getTracks().forEach((track) => pc.addTrack(track, local));

  pc.ontrack = (event) => {
    remoteAudio.srcObject = event.streams[0];
    remoteAudio.play().catch(() => {});
  };
  pc.onicecandidate = (event) => {
    if (event.candidate) addDoc(collection(callRef, mySide), event.candidate.toJSON()).catch(() => {});
  };
  pc.onconnectionstatechange = () => {
    if (pc.connectionState === 'connected') events.onPhase('connected');
    if (pc.connectionState === 'failed') {
      finish('ended', "Couldn't connect the call. Check your internet and try again.");
    }
  };

  const addCandidate = (candidate: RTCIceCandidateInit) => {
    if (pc.remoteDescription) pc.addIceCandidate(candidate).catch(() => {});
    else pendingCandidates.push(candidate);
  };
  const flushCandidates = () => {
    pendingCandidates.splice(0).forEach((c) => pc.addIceCandidate(c).catch(() => {}));
  };

  /** Stops audio and listeners; optionally records the final status for the other person. */
  const finish = (status: CallStatus | null, message?: string) => {
    if (finished) return;
    finished = true;
    if (status) updateDoc(callRef, { status, endedAtISO: nowISO() }).catch(() => {});
    unsubscribers.forEach((u) => u());
    local.getTracks().forEach((t) => t.stop());
    remoteAudio.srcObject = null;
    pc.close();
    events.onPhase('ended', message);
  };

  const listen = () => {
    unsubscribers.push(
      onSnapshot(collection(callRef, otherSide), (snap) =>
        snap.docChanges().forEach((change) => {
          if (change.type === 'added') addCandidate(change.doc.data() as RTCIceCandidateInit);
        })
      ),
      onSnapshot(callRef, (snap) => {
        if (!snap.exists()) return finish(null, 'Call ended');
        const call = { id: snap.id, ...snap.data() } as CallDoc;
        if (call.status === 'declined') return finish(null, 'Call declined');
        if (call.status === 'missed') return finish(null, 'No answer');
        if (call.status === 'ended') return finish(null, 'Call ended');
        onCallDoc(call, pc);
      })
    );
  };

  const session: CallSession = {
    callId,
    hangUp: () => finish('ended', 'Call ended'),
    setMuted: (muted) => local.getAudioTracks().forEach((t) => (t.enabled = !muted)),
  };

  return { pc, session, listen, finish, flushCandidates };
}

/** Rings another user. Resolves once the call is placed; progress is reported through events. */
export async function startVoiceCall(
  callee: CallParty,
  me: { name: string; avatar: string },
  events: CallEvents
): Promise<CallSession> {
  const user = auth.currentUser;
  if (!user) throw new Error('Please log in to make in-app calls.');
  if (!callee.id || callee.id === user.uid) throw new Error('In-app calling is not available for this person.');
  if (!isInAppCallSupported()) throw new Error('In-app calls are not supported on this device.');

  const local = await getMicrophone();
  const callRef = doc(collection(db, 'calls'));
  let ringTimer: ReturnType<typeof setTimeout> | undefined;
  let answered = false;

  const { pc, session, listen, finish, flushCandidates } = createSession(
    callRef.id,
    'callerCandidates',
    local,
    { onPhase: (phase, message) => {
      if (phase === 'ended') clearTimeout(ringTimer);
      events.onPhase(phase, message);
    } },
    (call, connection) => {
      if (call.answer && !connection.currentRemoteDescription) {
        answered = true;
        clearTimeout(ringTimer);
        connection
          .setRemoteDescription(new RTCSessionDescription(call.answer))
          .then(flushCandidates)
          .catch(() => finish('ended', "Couldn't connect the call."));
      }
    }
  );

  try {
    const offer = await pc.createOffer({ offerToReceiveAudio: true });
    const record: Omit<CallDoc, 'id'> & { participants: string[] } = {
      callerId: user.uid,
      calleeId: callee.id,
      participants: [user.uid, callee.id],
      caller: { id: user.uid, name: me.name || 'Haraka user', avatar: me.avatar || '' },
      callee: { id: callee.id, name: callee.name || 'Haraka user', avatar: callee.avatar || '' },
      status: 'ringing',
      offer: { type: offer.type, sdp: offer.sdp || '' },
      createdAtISO: nowISO(),
    };
    // The call must exist before network candidates are saved under it
    await setDoc(callRef, record);
    await pc.setLocalDescription(offer);
  } catch (err) {
    finish(null);
    throw err instanceof Error && err.message.includes('permission')
      ? new Error('Could not start the call. Please try again.')
      : err;
  }

  listen();
  events.onPhase('ringing');
  ringTimer = setTimeout(() => {
    if (!answered) finish('missed', 'No answer');
  }, RING_TIMEOUT_MS);
  return session;
}

/** Calls ringing for this user right now (newest first). */
export function watchIncomingCalls(uid: string, callback: (calls: CallDoc[]) => void): () => void {
  const q = query(collection(db, 'calls'), where('calleeId', '==', uid), where('status', '==', 'ringing'));
  return onSnapshot(
    q,
    (snap) => {
      const freshAfter = Date.now() - RING_TIMEOUT_MS - 15_000;
      callback(
        snap.docs
          .map((d) => ({ id: d.id, ...d.data() }) as CallDoc)
          .filter((c) => Date.parse(c.createdAtISO) > freshAfter)
          .sort((a, b) => b.createdAtISO.localeCompare(a.createdAtISO))
      );
    },
    (err) => {
      console.warn('Incoming calls listener failed', err);
      callback([]);
    }
  );
}

/** Picks up a ringing call. */
export async function answerVoiceCall(call: CallDoc, events: CallEvents): Promise<CallSession> {
  if (!call.offer) throw new Error('This call is no longer available.');
  if (!isInAppCallSupported()) throw new Error('In-app calls are not supported on this device.');
  const local = await getMicrophone();
  const { pc, session, listen, finish, flushCandidates } = createSession(call.id, 'calleeCandidates', local, events, () => {});
  events.onPhase('connecting');
  try {
    await pc.setRemoteDescription(new RTCSessionDescription(call.offer));
    flushCandidates();
    const answer = await pc.createAnswer();
    await pc.setLocalDescription(answer);
    await updateDoc(doc(db, 'calls', call.id), {
      answer: { type: answer.type, sdp: answer.sdp || '' },
      status: 'accepted',
      answeredAtISO: nowISO(),
    });
  } catch {
    finish(null);
    throw new Error('This call is no longer available.');
  }
  listen();
  return session;
}

export function declineVoiceCall(callId: string): Promise<void> {
  return updateDoc(doc(db, 'calls', callId), { status: 'declined', endedAtISO: nowISO() });
}
