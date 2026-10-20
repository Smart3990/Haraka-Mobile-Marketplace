/**
 * Marketplace categories: the built-in ones plus what the system admin changed from the dashboard
 * (/categories/{slug}): a new photo for a built-in category, or a whole new category. Everyone can
 * read them; only the system admin can change them. The last list is remembered on the phone so
 * categories show instantly on the next launch.
 */
import { useSyncExternalStore } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';
import { CATEGORIES as BUILT_IN, type Category } from './listingData';

export interface CategoryDoc {
  slug: string;
  name?: string;
  image?: string;
  subcategories?: string[];
  custom?: boolean;
  order?: number;
  /** A built-in category the system admin deleted (kept so it can be restored) */
  hidden?: boolean;
}

/** A category as the app shows it; `image` is the admin's photo when one was set. */
export type AppCategory = Category & { image?: string; custom?: boolean };

const CACHE_KEY = 'haraka.categories';

function merge(docs: CategoryDoc[]): AppCategory[] {
  const bySlug = new Map(docs.map((d) => [d.slug, d]));
  const builtIn: AppCategory[] = BUILT_IN.filter((c) => !bySlug.get(c.slug)?.hidden).map((c) => {
    const d = bySlug.get(c.slug);
    return d ? { ...c, image: d.image || undefined } : c;
  });
  const added: AppCategory[] = docs
    .filter((d) => d.custom && d.name && !BUILT_IN.some((c) => c.slug === d.slug))
    .sort((a, b) => (a.order || 0) - (b.order || 0))
    .map((d) => ({
      id: `cat-${d.slug}`,
      name: d.name!,
      slug: d.slug,
      icon: 'Package',
      count: 0,
      color: '#0F172A',
      bgLight: '#E8EDF2',
      subcategories: d.subcategories || [],
      image: d.image || undefined,
      custom: true,
    }));
  return [...builtIn, ...added];
}

let docs: CategoryDoc[] = (() => {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
  } catch {
    return [];
  }
})();
let current: AppCategory[] = merge(docs);
const listeners = new Set<() => void>();
let watching = false;

function startWatching() {
  if (watching) return;
  watching = true;
  onSnapshot(
    collection(db, 'categories'),
    (snap) => {
      docs = snap.docs.map((d) => ({ ...(d.data() as CategoryDoc), slug: d.id }));
      current = merge(docs);
      try {
        localStorage.setItem(CACHE_KEY, JSON.stringify(docs));
      } catch {
        // storage unavailable: categories still load from the database
      }
      listeners.forEach((notify) => notify());
    },
    (error) => {
      watching = false;
      console.warn('Could not load categories', error);
    }
  );
}

function subscribe(notify: () => void) {
  listeners.add(notify);
  startWatching();
  return () => listeners.delete(notify);
}

/** All categories (built-in first, then the ones the admin added); updates live. */
export function useCategories(): AppCategory[] {
  return useSyncExternalStore(subscribe, () => current, () => current);
}

/** Built-in categories the system admin deleted (they can be restored). */
export function hiddenBuiltInCategories(): Category[] {
  return BUILT_IN.filter((c) => docs.some((d) => d.slug === c.slug && d.hidden));
}

/** The admin's saved category records (to know which built-in photos were replaced). */
export function categoryDocs(): CategoryDoc[] {
  return docs;
}
