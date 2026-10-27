/**
 * App branding the system admin can change from the dashboard: the logo in the app bar, the
 * picture on the Welcome page and the app's theme colours. Stored in /settings/branding (anyone
 * can read it; only the system admin can change it). Empty values mean "use the built-in one".
 */
import { useSyncExternalStore } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

export type ThemeColorKey = 'primaryColor' | 'deepColor' | 'accentColor' | 'inkColor' | 'backgroundColor';

/** The theme colours, each pointing at a CSS variable from src/index.css */
export const THEME_COLORS: { key: ThemeColorKey; cssVar: string; label: string; note: string; fallback: string }[] = [
  { key: 'primaryColor', cssVar: '--color-brand', label: 'Primary green', note: 'Main buttons, prices, links, Verified tick', fallback: '#25D366' },
  { key: 'deepColor', cssVar: '--color-brand-deep', label: 'Dark green', note: 'Dark green headers, badges and cards', fallback: '#065F46' },
  { key: 'accentColor', cssVar: '--color-accent', label: 'Accent orange', note: 'Orange buttons, tabs, "View All" and highlights', fallback: '#FF6A00' },
  { key: 'inkColor', cssVar: '--color-ink', label: 'Text & dark buttons', note: 'Headings, main text and black buttons', fallback: '#0F172A' },
  { key: 'backgroundColor', cssVar: '--color-surface', label: 'Page background', note: 'Behind the cards on every page', fallback: '#F8FAFC' },
];

export type Branding = { logoUrl: string; welcomeImageUrl: string } & Record<ThemeColorKey, string>;

const isHex = (value: unknown): value is string => typeof value === 'string' && /^#[0-9a-f]{6}$/i.test(value);

/** Points each theme colour at the admin's choice (or back to the built-in one). */
function applyTheme(branding: Branding) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement.style;
  for (const { key, cssVar } of THEME_COLORS) {
    if (isHex(branding[key])) root.setProperty(cssVar, branding[key]);
    else root.removeProperty(cssVar);
  }
}

const EMPTY: Branding = { logoUrl: '', welcomeImageUrl: '', primaryColor: '', deepColor: '', accentColor: '', inkColor: '', backgroundColor: '' };
const CACHE_KEY = 'haraka.branding';

// Last known branding, so the right logo and colours show instantly on the next launch (even offline)
let current: Branding = (() => {
  try {
    return { ...EMPTY, ...JSON.parse(localStorage.getItem(CACHE_KEY) || '{}') };
  } catch {
    return EMPTY;
  }
})();
applyTheme(current);
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
        ...(Object.fromEntries(THEME_COLORS.map(({ key }) => [key, isHex(data[key]) ? data[key] : ''])) as Record<ThemeColorKey, string>),
      };
      if ((Object.keys(next) as (keyof Branding)[]).every((k) => next[k] === current[k])) return;
      current = next;
      applyTheme(next);
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
