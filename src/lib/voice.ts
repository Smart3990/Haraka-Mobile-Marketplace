/**
 * Real voice notes: record from the microphone into a data: URL (so it can be saved in
 * Firestore and played on any device) and play recordings back.
 */

export interface VoiceRecording {
  /** Stops recording. With save=false (or nothing recorded) resolves to null. */
  stop(save?: boolean): Promise<{ dataUrl: string; seconds: number } | null>;
}

/** Recordings stop automatically past this size so they still fit in one Firestore document. */
export const MAX_RECORDING_BYTES = 300_000;

/**
 * Voice notes are speech only, so they are recorded small to save data: one channel, with the
 * phone's noise and echo cleanup, at 16 kbps (about 120 KB per minute with Opus on Android).
 */
export const VOICE_BITS_PER_SECOND = 16_000;
export const VOICE_MIC: MediaTrackConstraints = {
  channelCount: 1,
  echoCancellation: true,
  noiseSuppression: true,
  autoGainControl: true,
};

/** Best small format the phone can record: WebM/Opus (Android), else MP4/AAC (iPhone). */
export function voiceMimeType(): string | undefined {
  return ['audio/webm;codecs=opus', 'audio/ogg;codecs=opus', 'audio/webm', 'audio/mp4', 'audio/ogg'].find((t) =>
    MediaRecorder.isTypeSupported(t)
  );
}

/** Microphone stream for a voice note (falls back to plain audio if the phone rejects the settings). */
export async function openVoiceMic(): Promise<MediaStream> {
  try {
    return await navigator.mediaDevices.getUserMedia({ audio: VOICE_MIC });
  } catch (error) {
    if ((error as { name?: string })?.name === 'NotAllowedError') throw error;
    return navigator.mediaDevices.getUserMedia({ audio: true });
  }
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/**
 * Starts recording. Throws an Error with a user-friendly message when the microphone is
 * unavailable or permission is denied. `onLimitReached` fires if the size cap stops it early.
 */
export async function startVoiceRecording(onLimitReached?: () => void): Promise<VoiceRecording> {
  if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
    throw new Error('Voice recording is not supported on this device.');
  }
  let stream: MediaStream;
  try {
    stream = await openVoiceMic();
  } catch {
    throw new Error('Microphone access is needed. Allow it in your phone settings and try again.');
  }

  const mimeType = voiceMimeType();
  const recorder = new MediaRecorder(stream, { ...(mimeType ? { mimeType } : {}), audioBitsPerSecond: VOICE_BITS_PER_SECOND });
  const chunks: Blob[] = [];
  let bytes = 0;
  const startedAt = Date.now();
  let limitHit = false;

  recorder.ondataavailable = (event) => {
    if (!event.data || event.data.size === 0) return;
    chunks.push(event.data);
    bytes += event.data.size;
    if (bytes > MAX_RECORDING_BYTES && recorder.state === 'recording' && !limitHit) {
      limitHit = true;
      onLimitReached?.();
    }
  };
  recorder.start(250);

  return {
    stop(save = true) {
      return new Promise((resolve, reject) => {
        const finish = async () => {
          stream.getTracks().forEach((track) => track.stop());
          if (!save || chunks.length === 0) return resolve(null);
          try {
            const blob = new Blob(chunks, { type: recorder.mimeType || 'audio/webm' });
            resolve({ dataUrl: await blobToDataUrl(blob), seconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)) });
          } catch (err) {
            reject(err);
          }
        };
        if (recorder.state === 'inactive') {
          finish();
        } else {
          recorder.onstop = finish;
          recorder.stop();
        }
      });
    },
  };
}

/**
 * Plays a recording. Calls onProgress(fraction 0-1, seconds played) while playing and onEnd when
 * it finishes or fails. Returns a function that stops playback.
 */
export function playVoice(
  url: string,
  handlers: { onProgress?: (fraction: number, seconds: number) => void; onEnd?: () => void; onError?: () => void; rate?: number }
): () => void {
  const audio = new Audio(url);
  audio.playbackRate = handlers.rate || 1;
  let stopped = false;
  const stop = () => {
    if (stopped) return;
    stopped = true;
    audio.pause();
    handlers.onEnd?.();
  };
  audio.ontimeupdate = () => {
    const total = Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0;
    handlers.onProgress?.(total ? Math.min(1, audio.currentTime / total) : 0, audio.currentTime);
  };
  audio.onended = stop;
  audio.onerror = () => {
    handlers.onError?.();
    stop();
  };
  audio.play().catch(() => {
    handlers.onError?.();
    stop();
  });
  return stop;
}
