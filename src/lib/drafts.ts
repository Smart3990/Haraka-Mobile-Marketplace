/**
 * Form drafts kept on the phone, so what someone typed survives a dropped connection, a crash or
 * closing the app. Photos can be too big for phone storage: then the draft is kept without them.
 */
const PREFIX = 'haraka.draft.';

/** Saves a draft. `withoutPhotos` gives a lighter copy to keep when the full one does not fit. */
export function saveDraft<T>(key: string, value: T, withoutPhotos?: (value: T) => T): void {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch {
    if (!withoutPhotos) return;
    try {
      localStorage.setItem(PREFIX + key, JSON.stringify(withoutPhotos(value)));
    } catch {
      // phone storage unavailable or full: the form still works, it just is not kept
    }
  }
}

export function loadDraft<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function clearDraft(key: string): void {
  try {
    localStorage.removeItem(PREFIX + key);
  } catch {
    // nothing to clear
  }
}

/** Drops photos and recordings (data: URLs) anywhere inside a draft. */
export function stripMedia<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, (_key, v) => (typeof v === 'string' && v.startsWith('data:') ? '' : v)));
}
