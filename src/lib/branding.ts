/**
 * App branding the system admin can change from the dashboard: the logo in the app bar and the
 * picture on the Welcome page. Stored in /settings/branding (anyone can read it; only the system
 * admin can change it). Empty values mean "use the built-in image".
 */
import { useSyncExternalStore } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export interface Branding {
  logoUrl: string;
  welcomeImageUrl: string;
}

const EMPTY: Branding = { logoUrl: '', welcomeImageUrl: '' };
const CACHE_KEY = 'haraka.branding';

// Last known branding, so the right logo shows instantly on the next launch (even offline)
let current: Branding = (() => {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') };
  } catch {
    return EMPTY;
  }
})();
const listeners = new Set<() => void>();
let stopWatching: (() => void) | null = null;

function startWatching() {
  if (stopWatching) return;
  stopWatching = onSnapshot(
    doc(db, 'settings', 'branding'),
    (snap) => {
      const data = snap.exists() ? snap.data() : {};
      const next: Branding = {
        logoUrl: typeof data.logoUrl === 'string' ? data.logoUrl : '',
        welcomeImageUrl: typeof data.welcomeImageUrl === 'string' ? data.welcomeImageUrl : '',
      };
      if (next.logoUrl === current.logoUrl && next.welcomeImageUrl === current.welcomeImageUrl) return;
      current = next;
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(next));
      } catch {
        // storage unavailable: branding still loads from the database
      }
      listeners.forEach((notify) => notify());
    },
    (error) => console.warn('Could not load branding', error)
  );
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  startWatching();
  return () => listeners.delete(notify);
}

/** Current branding; screens using it update as soon as the admin changes it. */
export function useBranding(): Branding {
  return useSyncExternalStore(subscribe, () => current, () => current);
}
