/**
 * Home banners managed from Platform Settings (/banners/{id}): banners an admin added, and
 * Haraka's starting banners an admin edited, moved or deleted. Everyone can read them; only admins with banner access change
 * them. The last list is remembered on the phone so banners show instantly on the next launch.
 */
import { useSyncExternalStore } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

/** Who sees a banner on Home */
export type BannerAudience = 'everyone' | 'buyer' | 'seller' | 'artisan' | 'applicant' | 'admin';

export interface BannerDoc {
  id: string;
  /** One of Haraka's starting banners (edited, moved or deleted by an admin) */
  builtIn?: boolean;
  hidden?: boolean;
  title: string;
  desc: string;
  btnText: string;
  /** Where the button goes, e.g. 'search', 'post-ad', 'artisans', 'profile', 'dashboard' or 'category:<slug>' */
  target: string;
  /** A solid colour (#RRGGBB) or a left-to-right gradient of 2-3 colours */
  bg: string;
  /** '' = the Haraka illustration, 'none' = no picture, otherwise the uploaded picture */
  image: string;
  audience: BannerAudience;
  order: number;
  updatedAtISO: string;
}

/** Background choices offered in the banner editor (the gradients are the ones the app's own banners use). */
export const BANNER_SOLID_COLORS = [
  '#FF5722', '#EA580C', '#1FA971', '#047857', '#2563EB', '#1D4ED8',
  '#7C3AED', '#DB2777', '#DC2626', '#0F766E', '#0F172A', '#334155',
];
export const BANNER_GRADIENTS = [
  'linear-gradient(to right, #FF5722, #FF6D00, #F57C00)',
  'linear-gradient(to right, #006C45, #059669, #10B981)',
  'linear-gradient(to right, #1D4ED8, #2563EB, #3B82F6)',
  'linear-gradient(to right, #6D28D9, #7C3AED, #8B5CF6)',
  'linear-gradient(to right, #1E293B, #334155, #0F172A)',
  'linear-gradient(to right, #991B1B, #B91C1C, #DC2626)',
];

const SAFE_BG = /^(#[0-9a-fA-F]{6}|linear-gradient\(to right(, #[0-9a-fA-F]{6}){2,3}\))$/;

/** The banner background as CSS, falling back to Haraka orange for anything unexpected. */
export function bannerBackground(bg: string): string {
  return SAFE_BG.test(bg) ? bg : BANNER_GRADIENTS[0];
}

const CACHE_KEY = 'haraka.banners';

let docs: BannerDoc[] = (() => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
  } catch {
    return [];
  }
})();
const listeners = new Set<() => void>();
let watching = false;

function startWatching() {
  if (watching) return;
  watching = true;
  onSnapshot(
    collection(db, 'banners'),
    (snap) => {
      docs = snap.docs.map((d) => ({ ...(d.data() as BannerDoc), id: d.id }));
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(docs));
      } catch {
        // storage unavailable: banners still load from the database
      }
      listeners.forEach((notify) => notify());
    },
    (error) => {
      watching = false;
      console.warn('Could not load banners', error);
    }
  );
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  startWatching();
  return () => listeners.delete(notify);
}

/** Every banner record (added banners and hidden built-in ones); updates live. */
export function useBannerDocs(): BannerDoc[] {
  return useSyncExternalStore(subscribe, () => docs, () => docs);
}
