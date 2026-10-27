/**
 * App branding the system admin can change from the dashboard: the logo in the app bar, the
 * picture on the Welcome page and the primary green. Stored in /settings/branding (anyone can read it; only the system
 * admin can change it). Empty values mean "use the built-in image".
 */
import { useSyncExternalStore } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export interface Branding {
  logoUrl: string;
  welcomeImageUrl: string;
  /** Primary colour as #RRGGBB; empty means the built-in green */
  primaryColor: string;
}

export const DEFAULT_PRIMARY_COLOR = '#25D366';

/** Points the app's brand colour (Tailwind's --color-brand) at the admin's choice. */
function applyPrimaryColor(color: string) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement.style;
  if (/^#[0-9a-f]{6}$/i.test(color)) root.setProperty('--color-brand', color);
  else root.removeProperty('--color-brand');
}

const EMPTY: Branding = { logoUrl: '', welcomeImageUrl: '', primaryColor: '' };
const CACHE_KEY = 'haraka.branding';

// Last known branding, so the right logo shows instantly on the next launch (even offline)
let current: Branding = (() => {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') };
  } catch {
    return EMPTY;
  }
})();
applyPrimaryColor(current.primaryColor);
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
        primaryColor: typeof data.primaryColor === 'string' ? data.primaryColor : '',
      };
      if (
        next.logoUrl === current.logoUrl &&
        next.welcomeImageUrl === current.welcomeImageUrl &&
        next.primaryColor === current.primaryColor
      )
        return;
      current = next;
      applyPrimaryColor(next.primaryColor);
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
