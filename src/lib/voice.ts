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

/** Sample rate and bitrate of saved voice notes: speech quality, about 120 KB per minute. */
const MP3_SAMPLE_RATE = 16_000;
const MP3_KBPS = 16;

/**
 * Makes a recording playable on every phone. Android records WebM/Opus, which iPhones cannot
 * play, so anything that is not already MP4/AAC or MP3 is converted to a small MP3 here.
 * If the conversion fails the original recording is kept.
 */
export async function toPlayableVoice(blob: Blob): Promise<Blob> {
  if (/mp4|aac|mpeg|mp3|m4a/i.test(blob.type)) return blob;
  try {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new Ctx();
    let decoded: AudioBuffer;
    try {
      decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
    } finally {
      ctx.close().catch(() => {});
    }
    // Mix down to one channel at 16 kHz
    const length = Math.max(1, Math.ceil(decoded.duration * MP3_SAMPLE_RATE));
    const offline = new OfflineAudioContext(1, length, MP3_SAMPLE_RATE);
    const source = offline.createBufferSource();
    source.buffer = decoded;
    source.connect(offline.destination);
    source.start();
    const samples = (await offline.startRendering()).getChannelData(0);
    const pcm = new Int16Array(samples.length);
    for (let i = 0; i < samples.length; i++) {
      const v = Math.max(-1, Math.min(1, samples[i]));
      pcm[i] = v < 0 ? v * 0x8000 : v * 0x7fff;
    }
    const { Mp3Encoder } = await import('@breezystack/lamejs');
    const encoder = new Mp3Encoder(1, MP3_SAMPLE_RATE, MP3_KBPS);
    const parts: BlobPart[] = [];
    for (let i = 0; i < pcm.length; i += 1152) {
      const chunk = encoder.encodeBuffer(pcm.subarray(i, i + 1152));
      if (chunk.length) parts.push(new Uint8Array(chunk));
    }
    const end = encoder.flush();
    if (end.length) parts.push(new Uint8Array(end));
    return new Blob(parts, { type: 'audio/mpeg' });
  } catch (error) {
    console.warn('Could not convert the voice note to MP3; keeping the original', error);
    return blob;
  }
}

/** Recording as a data: URL, converted so it plays on every phone. */
export async function voiceBlobToDataUrl(blob: Blob): Promise<string> {
  return blobToDataUrl(await toPlayableVoice(blob));
}

/**
 * URL to play a saved voice note from. Notes stored on Cloudinary are delivered as MP3, which
 * every phone can play (older Android notes are WebM, which iPhones can't), and it's smaller too.
 * data: URLs become blob: URLs, which iPhones play more reliably.
 */
export function playableVoiceUrl(url: string): string {
  if (/^https:\/\/res\.cloudinary\.com\/[^/]+\/video\/upload\//.test(url)) {
    return url.replace(/\.(webm|weba|ogg|oga|opus|wav|mp4|m4a|aac|caf|3gp)(\?.*)?$/i, '.mp3');
  }
  if (url.startsWith('data:')) {
    try {
      const comma = url.indexOf(',');
      const meta = url.slice(5, comma);
      const isBase64 = meta.endsWith(';base64');
      const raw = isBase64 ? atob(url.slice(comma + 1)) : decodeURIComponent(url.slice(comma + 1));
      const bytes = new Uint8Array(raw.length);
      for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
      return URL.createObjectURL(new Blob([bytes], { type: meta.split(';')[0] || 'audio/mpeg' }));
    } catch {
      return url;
    }
  }
  return url;
}

/**
 * An audio player for a voice note that works on iPhone: plays inline, and if the phone can't
 * play the file's format (e.g. an old WebM note kept inside the ad), converts it to MP3 and
 * tries once more. Call play() straight from the tap so iPhones allow the sound.
 */
export function createVoiceAudio(url: string): HTMLAudioElement {
  const audio = new Audio();
  audio.preload = 'auto';
  audio.setAttribute('playsinline', '');
  audio.setAttribute('webkit-playsinline', '');
  audio.src = playableVoiceUrl(url);
  let retried = false;
  audio.addEventListener(
    'error',
    (event) => {
      if (retried || !url.startsWith('data:')) return;
      retried = true;
      event.stopImmediatePropagation();
      (async () => {
        const original = await (await fetch(url)).blob();
        const mp3 = await toPlayableVoice(original);
        if (mp3 === original) throw new Error('unsupported');
        audio.src = URL.createObjectURL(mp3);
        await audio.play();
      })().catch(() => audio.dispatchEvent(new Event('error')));
    },
    true
  );
  return audio;
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
            resolve({ dataUrl: await voiceBlobToDataUrl(blob), seconds: Math.max(1, Math.round((Date.now() - startedAt) / 1000)) });
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
  const audio = createVoiceAudio(url);
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
