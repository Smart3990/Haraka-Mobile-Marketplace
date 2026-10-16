/**
 * Real Firebase backend for Haraka: email/password accounts, user profiles
 * (/users/{uid}), partner applications (/applications/{uid}) and marketplace
 * listings (/listings/{id}). Access is enforced by firestore.rules.
 */
import { deleteApp, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  getCountFromServer,
  getFirestore,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  where,
  updateDoc,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { auth, db } from './firebase';
import type { Listing } from './listingData';

export type UserRole = 'buyer' | 'seller' | 'artisan' | 'admin';

export interface UserProfileDoc {
  id: string;
  email: string;
  name: string;
  /** Set only by an admin decision (see decideApplication); new accounts are 'buyer'. */
  role: UserRole;
  /** True when an admin approved the account with all required documents. */
  verified?: boolean;
  phone?: string;
  location?: string;
  avatar?: string;
  storeName?: string;
  whatsapp?: string;
  bio?: string;
  createdAt: string;
}

/**
 * The permanent system admin. Always has full admin rights (including adding admins)
 * and is never counted among, or listed with, the admins it adds. Mirrors firestore.rules.
 */
export const SYSTEM_ADMIN_EMAIL = 'blanc.69458@gmail.com';

export interface AdminAccess {
  isAdmin: boolean;
  /** May open the "add admin" form */
  canAddAdmins: boolean;
  isSystemAdmin: boolean;
}

const NO_ADMIN_ACCESS: AdminAccess = { isAdmin: false, canAddAdmins: false, isSystemAdmin: false };

/** Watches whether the signed-in user is an admin (system admin, or listed in /admins/{email}). */
export function watchAdminAccess(user: User | null, callback: (access: AdminAccess) => void): () => void {
  const email = user?.email?.toLowerCase();
  if (!email) {
    callback(NO_ADMIN_ACCESS);
    return () => {};
  }
  if (email === SYSTEM_ADMIN_EMAIL) {
    callback({ isAdmin: true, canAddAdmins: true, isSystemAdmin: true });
    return () => {};
  }
  return onSnapshot(
    doc(db, 'admins', email),
    (snap) =>
      callback(
        snap.exists() ? { isAdmin: true, canAddAdmins: Boolean(snap.data().canAddAdmins), isSystemAdmin: false } : NO_ADMIN_ACCESS
      ),
    () => callback(NO_ADMIN_ACCESS)
  );
}

export interface AdminRecord {
  email: string;
  name: string;
  canAddAdmins: boolean;
  addedBy: string;
  createdAtISO: string;
}

/** Admins added through the app (the system admin is not in this list). Admins only. */
export function watchAdmins(callback: (admins: AdminRecord[]) => void): () => void {
  return onSnapshot(
    collection(db, 'admins'),
    (snap) => callback(snap.docs.map((d) => d.data() as AdminRecord)),
    (error) => console.warn('Could not load admins', error)
  );
}

/**
 * Adds a new admin. Creates their Haraka account with the temporary password (on a separate
 * Firebase instance, so the current admin stays signed in) and emails them a verification link;
 * if the email already has an account, that account is given admin access. Either way, admin
 * rights only work after the email address is verified (enforced in firestore.rules).
 */
export async function addAdmin(input: { name: string; email: string; password: string; canAddAdmins: boolean }) {
  const current = auth.currentUser;
  if (!current?.email) throw new Error('Please log in again.');
  const email = input.email.trim().toLowerCase();
  if (email === SYSTEM_ADMIN_EMAIL) throw new Error('This is already the system admin.');

  let accountCreated = false;
  const helperApp = initializeApp(firebaseConfig, `add-admin-${Date.now()}`);
  try {
    const helperAuth = getAuth(helperApp);
    try {
      const cred = await createUserWithEmailAndPassword(helperAuth, email, input.password);
      await updateProfile(cred.user, { displayName: input.name });
      // Admin access only switches on once they prove they own this email address
      await sendEmailVerification(cred.user);
      await setDoc(doc(getFirestore(helperApp, firebaseConfig.firestoreDatabaseId), 'users', cred.user.uid), {
        id: cred.user.uid,
        email,
        name: input.name,
        role: 'buyer',
        createdAt: new Date().toISOString(),
      });
      accountCreated = true;
    } catch (err) {
      if ((err as { code?: string }).code !== 'auth/email-already-in-use') throw err;
    }
  } finally {
    await deleteApp(helperApp);
  }

  await setDoc(doc(db, 'admins', email), {
    email,
    name: input.name,
    canAddAdmins: input.canAddAdmins,
    addedBy: current.email.toLowerCase(),
    createdAtISO: new Date().toISOString(),
  } satisfies AdminRecord);
  return { accountCreated };
}

export interface PlatformStats {
  totalUsers: number;
  sellers: number;
  artisans: number;
  regularUsers: number;
  admins: number;
  openReports: number;
}

/** Live counts for the admin dashboard (admins only). */
export async function getPlatformStats(): Promise<PlatformStats> {
  const count = async (q: Parameters<typeof getCountFromServer>[0]) => (await getCountFromServer(q)).data().count;
  const users = collection(db, 'users');
  const [totalUsers, sellers, artisans, admins, openReports] = await Promise.all([
    count(users),
    count(query(users, where('role', '==', 'seller'))),
    count(query(users, where('role', '==', 'artisan'))),
    count(collection(db, 'admins')),
    count(query(collection(db, 'reports'), where('status', '==', 'open'))),
  ]);
  return { totalUsers, sellers, artisans, regularUsers: totalUsers - sellers - artisans, admins, openReports };
}

const AUTH_ERROR_MESSAGES: Record<string, string> = {
  'auth/email-already-in-use': 'An account with this email already exists. Try signing in instead.',
  'auth/invalid-email': 'Please enter a valid email address.',
  'auth/weak-password': 'Password is too weak. Use at least 6 characters.',
  'auth/user-not-found': 'No account found with this email.',
  'auth/wrong-password': 'Incorrect email or password.',
  'auth/invalid-credential': 'Incorrect email or password.',
  'auth/too-many-requests': 'Too many attempts. Please wait a moment and try again.',
  'auth/network-request-failed': 'No internet connection. Check your network and try again.',
  'auth/operation-not-allowed': 'Email sign-in is not enabled for this app yet.',
};

/** Turns a Firebase error into a message suitable for showing to the user. */
export function friendlyAuthError(error: unknown): string {
  const code = (error as { code?: string })?.code || '';
  return AUTH_ERROR_MESSAGES[code] || 'Something went wrong. Please try again.';
}

export async function signUpWithEmail(name: string, email: string, password: string): Promise<UserProfileDoc> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (name) await updateProfile(cred.user, { displayName: name });
  const profile: UserProfileDoc = {
    id: cred.user.uid,
    email,
    name,
    role: 'buyer',
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(db, 'users', cred.user.uid), profile);
  sendEmailVerification(cred.user).catch((err) => console.warn('Could not send verification email', err));
  return profile;
}

/** Re-sends the "verify your email" message to the signed-in user. */
export function resendEmailVerification(): Promise<void> {
  if (!auth.currentUser) return Promise.reject(new Error('Not signed in'));
  return sendEmailVerification(auth.currentUser);
}

export async function signInWithEmail(email: string, password: string): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export function sendPasswordReset(email: string): Promise<void> {
  return sendPasswordResetEmail(auth, email);
}

export function signOutUser(): Promise<void> {
  return firebaseSignOut(auth);
}

/** Loads the Firestore profile for a signed-in user, creating it if it is missing. */
export async function loadUserProfile(user: User): Promise<UserProfileDoc> {
  const ref = doc(db, 'users', user.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return snap.data() as UserProfileDoc;
  const profile: UserProfileDoc = {
    id: user.uid,
    email: user.email || '',
    name: user.displayName || '',
    role: 'buyer',
    createdAt: new Date().toISOString(),
  };
  await setDoc(ref, profile);
  return profile;
}

/** Saves the user's own editable profile fields (role and badge are admin-only). */
export async function saveUserProfile(uid: string, data: Partial<UserProfileDoc>): Promise<void> {
  const { role: _role, verified: _verified, ...editable } = data;
  if (editable.avatar?.startsWith('data:image')) editable.avatar = await compressImage(editable.avatar, 150_000);
  await updateDoc(doc(db, 'users', uid), stripUndefined(editable));
}

/**
 * Calls back with the signed-in user and their profile, or nulls when signed out.
 * The profile is watched live, so an admin's decision (new role) shows up at once.
 */
export function watchAuth(callback: (user: User | null, profile: UserProfileDoc | null) => void): () => void {
  let stopProfile: (() => void) | null = null;
  const stopAuth = onAuthStateChanged(auth, async (user) => {
    stopProfile?.();
    stopProfile = null;
    if (!user) {
      callback(null, null);
      return;
    }
    try {
      await loadUserProfile(user); // creates the profile on first sign-in
      stopProfile = onSnapshot(
        doc(db, 'users', user.uid),
        (snap) => callback(user, snap.exists() ? (snap.data() as UserProfileDoc) : null),
        (error) => {
          console.warn('Could not watch user profile', error);
          callback(user, null);
        }
      );
    } catch (error) {
      console.warn('Could not load user profile', error);
      callback(user, null);
    }
  });
  return () => {
    stopProfile?.();
    stopAuth();
  };
}

// ---------------------------------------------------------------------------
// Partner applications (become a seller / artisan)
// ---------------------------------------------------------------------------

export type ApplicationStatus = 'pending' | 'approved' | 'rejected';

/** An application as stored in /applications/{uid}; `id` is the applicant's uid. */
export type StoredApplication = Record<string, any> & {
  id: string;
  uid: string;
  role: 'seller' | 'artisan';
  status: ApplicationStatus;
  verifiedBadge?: boolean;
  rejectionReason?: string;
  submittedAtISO: string;
};

/** Ghana Card number and both card photos are required for the verified badge. */
export function hasRequiredDocuments(app: Record<string, any>): boolean {
  return Boolean(!app.idVerificationSkipped && app.ghanaCardId && app.frontPhoto && app.backPhoto);
}

/** Collects every data:image string inside an object so its photos can be shrunk together. */
function findPhotos(value: any, found: { holder: any; key: string }[] = []) {
  if (value && typeof value === 'object') {
    for (const [key, v] of Object.entries(value)) {
      if (typeof v === 'string' && v.startsWith('data:image')) found.push({ holder: value, key });
      else findPhotos(v, found);
    }
  }
  return found;
}

/** Saves (or re-submits) the signed-in user's partner application for admin review. */
export async function submitApplication(record: Record<string, any>): Promise<StoredApplication> {
  const user = auth.currentUser;
  if (!user) throw new Error('You need to be signed in to apply.');
  // Drop local-only blob: URLs and undefined values, then shrink all photos to fit in 1 MB
  const app = JSON.parse(
    JSON.stringify(record, (_key, value) => (typeof value === 'string' && value.startsWith('blob:') ? undefined : value))
  );
  const photos = findPhotos(app);
  const budget = Math.floor(850_000 / Math.max(1, photos.length));
  await Promise.all(photos.map(async ({ holder, key }) => (holder[key] = await compressImage(holder[key], budget))));

  const stored: StoredApplication = {
    ...app,
    id: user.uid,
    uid: user.uid,
    email: app.email && app.email !== '—' ? app.email : user.email || '',
    status: 'pending',
    verifiedBadge: false,
    rejectionReason: '',
    submittedAtISO: new Date().toISOString(),
  };
  await setDoc(doc(db, 'applications', user.uid), stored);
  return toApplication(user.uid, stored);
}

function toApplication(id: string, data: any): StoredApplication {
  return { ...data, id, dateSubmitted: timeAgo(data.submittedAtISO) };
}

/** The signed-in user's own application (or null if they never applied). */
export function watchMyApplication(uid: string, callback: (app: StoredApplication | null) => void): () => void {
  return onSnapshot(
    doc(db, 'applications', uid),
    (snap) => callback(snap.exists() ? toApplication(snap.id, snap.data()) : null),
    (error) => console.warn('Could not watch application', error)
  );
}

/** Every application, newest first. Only admins are allowed to read this. */
export function watchAllApplications(callback: (apps: StoredApplication[]) => void): () => void {
  return onSnapshot(
    query(collection(db, 'applications'), orderBy('submittedAtISO', 'desc')),
    (snap) => callback(snap.docs.map((d) => toApplication(d.id, d.data()))),
    (error) => console.warn('Could not load applications', error)
  );
}

export type ApplicationDecision = 'approve' | 'verify' | 'reject';

/**
 * Admin decision. Updates the application and the applicant's account together:
 * approve/verify grants the requested role; reject (or revoke) makes them a regular user again.
 */
export async function decideApplication(app: StoredApplication, decision: ApplicationDecision, reason = ''): Promise<void> {
  const admin = auth.currentUser;
  if (!admin?.email) throw new Error('Please log in again.');
  if (decision === 'verify' && !hasRequiredDocuments(app)) {
    throw new Error('All required documents (Ghana Card number and both photos) are needed to verify.');
  }
  const approved = decision !== 'reject';
  const batch = writeBatch(db);
  batch.update(doc(db, 'applications', app.uid), {
    status: approved ? 'approved' : 'rejected',
    verifiedBadge: decision === 'verify',
    rejectionReason: approved ? '' : reason,
    decidedAtISO: new Date().toISOString(),
    decidedBy: admin!.email,
  });
  batch.update(doc(db, 'users', app.uid), {
    role: approved ? app.role : 'buyer',
    verified: decision === 'verify',
    storeName: approved ? app.name || '' : '',
    ...(approved && app.phone ? { phone: app.phone } : {}),
    ...(approved && app.location ? { location: app.location } : {}),
  });
  await batch.commit();
}

export type StoredListing = Listing & { sellerId: string; createdAtISO: string };

/** "Just now", "5m ago", "3h ago", "2d ago", or a date for older ads. */
function timeAgo(iso: string): string {
  const seconds = (Date.now() - new Date(iso).getTime()) / 1000;
  if (!Number.isFinite(seconds) || seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 7 * 86400) return `${Math.floor(seconds / 86400)}d ago`;
  return new Date(iso).toLocaleDateString();
}

/** Live list of all listings in Firestore, newest first. */
export function watchListings(
  callback: (listings: StoredListing[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const q = query(collection(db, 'listings'), orderBy('createdAtISO', 'desc'));
  return onSnapshot(
    q,
    (snap) =>
      callback(
        snap.docs.map((d) => {
          const data = d.data() as StoredListing;
          return { ...data, id: d.id, createdAt: timeAgo(data.createdAtISO) };
        })
      ),
    (error) => {
      console.warn('Could not load listings', error);
      onError?.(error);
    }
  );
}

/** Removes keys with undefined values; Firestore rejects them. */
function stripUndefined<T extends object>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}

/** Firestore documents are limited to 1 MB; leave room for the text fields. */
const LISTING_MEDIA_BUDGET = 900_000;

export async function createListing(listing: Listing): Promise<StoredListing> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('You need to be signed in to post an ad.');

  // Voice notes are stored inline as data: URLs so every device can play them.
  let audio = listing.audioDescriptionUrl;
  if (audio?.startsWith('blob:')) audio = await blobToDataUrl(await (await fetch(audio)).blob());
  if (audio && audio.length > LISTING_MEDIA_BUDGET * 0.55) {
    throw new Error('Voice note is too long. Please record a shorter one.');
  }

  // Share what is left between the photos, shrinking further until they fit.
  const photoBudget = Math.floor((LISTING_MEDIA_BUDGET - (audio?.length || 0)) / Math.max(1, listing.images.length));
  const images = await Promise.all(listing.images.map((src) => compressImage(src, photoBudget)));

  const stored: StoredListing = stripUndefined({
    ...listing,
    images,
    hasAudioDescription: Boolean(audio),
    audioDescriptionUrl: audio,
    seller: { ...listing.seller, id: uid },
    sellerId: uid,
    createdAtISO: new Date().toISOString(),
  });
  await setDoc(doc(db, 'listings', listing.id), stored);
  return { ...stored, createdAt: 'Just now' };
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** Reads a photo picked from the camera or gallery, already shrunk for upload. */
export async function fileToPhotoDataUrl(file: File): Promise<string> {
  return compressImage(await blobToDataUrl(file), 200_000);
}

export function updateListing(id: string, data: Partial<Listing>): Promise<void> {
  return updateDoc(doc(db, 'listings', id), stripUndefined(data));
}

export function deleteListing(id: string): Promise<void> {
  return deleteDoc(doc(db, 'listings', id));
}

/** Sends a "report this listing" to the admins (stored in /reports). */
export async function submitReport(listing: { id: string; title: string; sellerId?: string }, reason: string, details: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please log in to report a listing.');
  const ref = doc(collection(db, 'reports'));
  await setDoc(ref, stripUndefined({
    id: ref.id,
    listingId: listing.id,
    listingTitle: listing.title,
    sellerId: listing.sellerId,
    reason,
    details: details.slice(0, 2000),
    reporterId: user.uid,
    reporterEmail: user.email || '',
    status: 'open',
    createdAtISO: new Date().toISOString(),
  }));
}

/**
 * Shrinks a photo (data: or blob: URL) to a JPEG of at most `maxChars` characters
 * so it fits in a Firestore document. Remote URLs are kept as they are.
 */
async function compressImage(src: string, maxChars: number): Promise<string> {
  if (!src.startsWith('data:') && !src.startsWith('blob:')) return src;
  if (src.startsWith('data:image/jpeg') && src.length <= maxChars) return src;
  const img = new Image();
  img.src = src;
  await img.decode();
  let result = src;
  for (let maxSize = 1280; maxSize >= 320; maxSize = Math.round(maxSize * 0.8)) {
    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(img.naturalWidth * scale);
    canvas.height = Math.round(img.naturalHeight * scale);
    const ctx = canvas.getContext('2d')!;
    // JPEG has no transparency, so give transparent PNGs a white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    result = canvas.toDataURL('image/jpeg', 0.72);
    if (result.length <= maxChars) break;
  }
  return result;
}
