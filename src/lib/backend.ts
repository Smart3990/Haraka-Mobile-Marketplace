/**
 * Real Firebase backend for Haraka: email/password accounts, user profiles
 * (/users/{uid}), partner applications (/applications/{uid}) and marketplace
 * listings (/listings/{id}). Access is enforced by firestore.rules.
 */
import { deleteApp, initializeApp } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  deleteUser,
  EmailAuthProvider,
  getAuth,
  onIdTokenChanged,
  reauthenticateWithCredential,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import {
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  getCountFromServer,
  getFirestore,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  limit,
  orderBy,
  query,
  setDoc,
  where,
  updateDoc,
  increment,
  writeBatch,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { isCloudinaryConfigured, uploadMedia } from './cloudinary';
import { auth, db } from './firebase';
import type { Listing } from './listingData';
import type { BannerDoc } from './banners';
import type { ThemeColorKey } from './branding';

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
  /** Ads the user saved (heart), kept on the account */
  savedListingIds?: string[];
  /** Sellers the user follows; their new ads appear in notifications */
  followedSellerIds?: string[];
  /** Notifications at or before this time count as read */
  notificationsReadAtISO?: string;
  /** People this user blocked: they cannot message or call them, and their ads and chats are hidden */
  blockedUserIds?: string[];
  createdAt: string;
}

/**
 * The permanent system admin. Always has full admin rights (including adding admins)
 * and is never counted among, or listed with, the admins it adds. Mirrors firestore.rules.
 */
export const SYSTEM_ADMIN_EMAIL = 'blanc.69458@gmail.com';

/**
 * Platform features the system admin can hand to other admins (Platform Settings > Admin
 * Permissions). Reviewing applications and reports stays open to every admin.
 */
export const ADMIN_PERMISSIONS = [
  { key: 'banners', label: 'Home banners', note: 'Add, edit and hide the banners on Home' },
  { key: 'categories', label: 'Categories', note: 'Photos, new categories, moving ads, deleting' },
  { key: 'branding', label: 'App branding', note: 'App bar logo and Welcome picture' },
  { key: 'editAds', label: 'Edit any ad', note: "Correct someone else's ad" },
] as const;
export type AdminPermission = (typeof ADMIN_PERMISSIONS)[number]['key'];
const ALL_PERMISSIONS = ADMIN_PERMISSIONS.map((p) => p.key) as AdminPermission[];

export interface AdminAccess {
  isAdmin: boolean;
  /** May open the "add admin" form */
  canAddAdmins: boolean;
  isSystemAdmin: boolean;
  /** Platform features this admin was given (the system admin has them all) */
  permissions: AdminPermission[];
}

const NO_ADMIN_ACCESS: AdminAccess = { isAdmin: false, canAddAdmins: false, isSystemAdmin: false, permissions: [] };

/** True when this admin may use that platform feature (always true for the system admin). */
export function hasAdminPermission(access: AdminAccess, permission: AdminPermission): boolean {
  return access.isSystemAdmin || (access.isAdmin && access.permissions.includes(permission));
}

// The signed-in person's admin access, so the functions below can refuse early with a clear message
let currentAccess: AdminAccess = NO_ADMIN_ACCESS;

function requirePermission(permission: AdminPermission, message: string): string {
  const email = auth.currentUser?.email?.toLowerCase();
  if (!email || !hasAdminPermission(email === SYSTEM_ADMIN_EMAIL ? { ...currentAccess, isSystemAdmin: true } : currentAccess, permission)) {
    throw new Error(message);
  }
  return email;
}

/** Watches whether the signed-in user is an admin (system admin, or listed in /admins/{email}). */
export function watchAdminAccess(user: User | null, onAccess: (access: AdminAccess) => void): () => void {
  const callback = (access: AdminAccess) => {
    currentAccess = access;
    onAccess(access);
  };
  const email = user?.email?.toLowerCase();
  if (!email) {
    callback(NO_ADMIN_ACCESS);
    return () => {};
  }
  if (email === SYSTEM_ADMIN_EMAIL) {
    callback({ isAdmin: true, canAddAdmins: true, isSystemAdmin: true, permissions: ALL_PERMISSIONS });
    return () => {};
  }
  return onSnapshot(
    doc(db, 'admins', email),
    (snap) =>
      callback(
        snap.exists()
          ? {
              isAdmin: true,
              canAddAdmins: Boolean(snap.data().canAddAdmins),
              isSystemAdmin: false,
              permissions: ((snap.data().permissions as string[]) || []).filter((p): p is AdminPermission =>
                (ALL_PERMISSIONS as string[]).includes(p)
              ),
            }
          : NO_ADMIN_ACCESS
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
  permissions?: AdminPermission[];
}

/** Admins added through the app (the system admin is not in this list). Admins only. */
export function watchAdmins(callback: (admins: AdminRecord[]) => void): () => void {
  return onSnapshot(
    collection(db, 'admins'),
    (snap) => callback(snap.docs.map((d) => d.data() as AdminRecord)),
    (error) => console.warn('Could not load admins', error)
  );
}

/** Removes an admin added in the app (the system admin cannot be removed). */
export function removeAdmin(email: string): Promise<void> {
  const key = email.trim().toLowerCase();
  if (key === SYSTEM_ADMIN_EMAIL) return Promise.reject(new Error('The system admin cannot be removed.'));
  return deleteDoc(doc(db, 'admins', key));
}

/** System admin: chooses which platform features another admin may use. */
export async function setAdminPermissions(email: string, permissions: AdminPermission[], canAddAdmins: boolean): Promise<void> {
  if (auth.currentUser?.email?.toLowerCase() !== SYSTEM_ADMIN_EMAIL) throw new Error('Only the system admin can change admin permissions.');
  await updateDoc(doc(db, 'admins', email.trim().toLowerCase()), {
    permissions: ALL_PERMISSIONS.filter((p) => permissions.includes(p)),
    canAddAdmins,
  });
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
  if (AUTH_ERROR_MESSAGES[code]) return AUTH_ERROR_MESSAGES[code];
  // Our own messages (no Firebase code) are already written for users
  if (!code && error instanceof Error && error.message) return error.message;
  return 'Something went wrong. Please try again.';
}

/**
 * Starts a sign-up: creates the login and emails a verification link. The Haraka account
 * (profile) is only created once the email is confirmed (see watchAuth). Signing up again with
 * an email that was never confirmed resumes that sign-up and re-sends the link.
 */
export async function signUpWithEmail(name: string, email: string, password: string): Promise<void> {
  let user: User;
  try {
    user = (await createUserWithEmailAndPassword(auth, email, password)).user;
  } catch (error) {
    if ((error as { code?: string })?.code !== 'auth/email-already-in-use') throw error;
    try {
      user = (await signInWithEmailAndPassword(auth, email, password)).user;
    } catch {
      throw new Error('This email is already registered. Please log in instead.');
    }
    if (user.emailVerified) return; // already a confirmed account: just signed in
  }
  if (name && user.displayName !== name) await updateProfile(user, { displayName: name });
  await sendEmailVerification(user).catch((err) => console.warn('Could not send verification email', err));
}

/** Re-sends the "verify your email" message to the signed-in user. */
export function resendEmailVerification(): Promise<void> {
  if (!auth.currentUser) return Promise.reject(new Error('Not signed in'));
  return sendEmailVerification(auth.currentUser);
}

/** True when the signed-in user has confirmed their email (or is the system admin). */
export function isEmailConfirmed(user: User | null): boolean {
  return Boolean(user && (user.emailVerified || (user.email || '').toLowerCase() === SYSTEM_ADMIN_EMAIL));
}

/**
 * Checks with Firebase whether the user has clicked the verification link yet. When they have,
 * the sign-in token is refreshed so the database also sees the confirmed email straight away.
 */
export async function checkEmailVerified(): Promise<boolean> {
  const user = auth.currentUser;
  if (!user) return false;
  await user.reload();
  const fresh = auth.currentUser;
  if (!fresh?.emailVerified) return false;
  await fresh.getIdToken(true);
  return true;
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

/** How long Platform Settings stays open after the admin re-enters their password (the database allows 30). */
export const ADMIN_UNLOCK_MINUTES = 15;

/**
 * Admin re-enters their login password before using Platform Settings. This refreshes the
 * sign-in time the database rules check, so settings changes need a recent password.
 */
export async function confirmAdminPassword(password: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Please log in again.');
  try {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
  } catch (error) {
    const code = (error as { code?: string })?.code || '';
    throw new Error(
      code.includes('wrong-password') || code.includes('invalid-credential') || code.includes('invalid-login')
        ? 'Incorrect password. Please try again.'
        : friendlyAuthError(error)
    );
  }
  await user.getIdToken(true);
}

/**
 * Permanently deletes the signed-in user's account: their ads, partner application (with ID
 * documents), public artisan profile, notification token and profile, then the login itself.
 * Chats and bookings stay so the other person keeps their history.
 */
export async function deleteMyAccount(password: string): Promise<void> {
  const user = auth.currentUser;
  if (!user || !user.email) throw new Error('Please log in again to delete your account.');
  if (user.email.toLowerCase() === SYSTEM_ADMIN_EMAIL) throw new Error('The system admin account cannot be deleted.');
  try {
    await reauthenticateWithCredential(user, EmailAuthProvider.credential(user.email, password));
  } catch (error) {
    const code = (error as { code?: string })?.code || '';
    throw new Error(
      code.includes('wrong-password') || code.includes('invalid-credential') || code.includes('invalid-login')
        ? 'Incorrect password. Please try again.'
        : friendlyAuthError(error)
    );
  }
  const uid = user.uid;
  const myListings = await getDocs(query(collection(db, 'listings'), where('sellerId', '==', uid)));
  await Promise.all(myListings.docs.map((d) => deleteDoc(d.ref)));
  await Promise.all(
    [doc(db, 'applications', uid), doc(db, 'artisans', uid), doc(db, 'pushTokens', uid)].map((ref) =>
      deleteDoc(ref).catch(() => {})
    )
  );
  await deleteDoc(doc(db, 'users', uid));
  await deleteUser(user);
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
  if (editable.avatar?.startsWith('data:image')) editable.avatar = await storeMedia(editable.avatar, 'avatars', 150_000);
  await updateDoc(doc(db, 'users', uid), stripUndefined(editable));
}

/**
 * Calls back with the signed-in user and their profile, or nulls when signed out.
 * The profile is watched live, so an admin's decision (new role) shows up at once.
 */
export function watchAuth(callback: (user: User | null, profile: UserProfileDoc | null) => void): () => void {
  let stopProfile: (() => void) | null = null;
  let current = '';
  // Token changes also report a newly confirmed email, which creates the account profile
  const stopAuth = onIdTokenChanged(auth, async (user) => {
    const key = user ? `${user.uid}:${isEmailConfirmed(user)}` : '';
    if (key === current) return;
    current = key;
    stopProfile?.();
    stopProfile = null;
    if (!user) {
      callback(null, null);
      return;
    }
    if (!isEmailConfirmed(user)) {
      // Not a Haraka account yet: no profile until the email is confirmed
      callback(user, null);
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
  /** An approved partner asking for the Verified badge after sending their ID documents */
  verificationRequestStatus?: '' | 'pending' | 'declined';
  verificationRequestedAtISO?: string;
  verificationDeclineReason?: string;
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

/** Largest PDF an application can include (photos are shrunk automatically; PDFs cannot be). */
export const MAX_APPLICATION_PDF_BYTES = 350_000;

/**
 * An application is stored as one database record, which is limited to 1 MB. Shrinks the photos
 * until everything fits, and explains clearly what to change if it still cannot fit.
 */
async function fitApplicationInOneDocument(app: Record<string, any>) {
  const LIMIT = 950_000;
  const photos = findPhotos(app);
  const pdfs = findDataUrls(app, 'data:application/pdf');
  for (const { holder, key } of pdfs) {
    if (holder[key].length * 0.75 > MAX_APPLICATION_PDF_BYTES) {
      throw new Error('Your PDF document is too large. Please upload a photo of the document instead (or a PDF under 350 KB).');
    }
  }
  const originals = photos.map(({ holder, key }) => holder[key] as string);
  const photoChars = originals.reduce((sum, p) => sum + p.length, 0);
  const otherChars = JSON.stringify(app).length - photoChars;
  let budget = Math.floor(Math.max(60_000, LIMIT - otherChars) / Math.max(1, photos.length));
  for (let attempt = 0; attempt < 4; attempt++) {
    try {
      await Promise.all(photos.map(async ({ holder, key }, i) => (holder[key] = await compressImage(originals[i], budget))));
    } catch {
      throw new Error('One of your photos could not be read. Please choose a JPG or PNG photo and try again.');
    }
    if (JSON.stringify(app).length <= LIMIT) return;
    budget = Math.floor(budget * 0.6);
  }
  throw new Error('Your application has too many large files. Please remove a document or use smaller photos and try again.');
}

function findDataUrls(value: any, prefix: string, found: { holder: any; key: string }[] = []) {
  if (value && typeof value === 'object') {
    for (const [key, v] of Object.entries(value)) {
      if (typeof v === 'string' && v.startsWith(prefix)) found.push({ holder: value, key });
      else findDataUrls(v, prefix, found);
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
  await fitApplicationInOneDocument(app);

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

/**
 * An approved partner (without the badge) sends their Ghana Card for verification. The photos
 * are shrunk so the whole application still fits in its one database record.
 */
export async function requestVerification(
  app: StoredApplication,
  docs: { ghanaCardId: string; frontPhoto: string; backPhoto: string }
): Promise<void> {
  const user = auth.currentUser;
  if (!user || user.uid !== app.uid) throw new Error('Please log in again.');
  const { id: _id, dateSubmitted: _date, frontPhoto: _f, backPhoto: _b, ...rest } = app;
  const budget = Math.floor(Math.max(60_000, Math.min(250_000, (950_000 - JSON.stringify(rest).length) / 2)));
  let frontPhoto: string;
  let backPhoto: string;
  try {
    [frontPhoto, backPhoto] = await Promise.all([compressImage(docs.frontPhoto, budget), compressImage(docs.backPhoto, budget)]);
  } catch {
    throw new Error('One of your photos could not be read. Please choose a JPG or PNG photo and try again.');
  }
  await updateDoc(doc(db, 'applications', app.uid), {
    ghanaCardId: docs.ghanaCardId,
    frontPhoto,
    backPhoto,
    idVerificationSkipped: false,
    verificationRequestStatus: 'pending',
    verificationRequestedAtISO: new Date().toISOString(),
    verificationDeclineReason: '',
  });
}

/** Admin turns down a verification request (the partner stays approved and can send new documents). */
export async function declineVerification(app: StoredApplication, reason: string): Promise<void> {
  if (!auth.currentUser?.email) throw new Error('Please log in again.');
  await updateDoc(doc(db, 'applications', app.uid), {
    verificationRequestStatus: 'declined',
    verificationDeclineReason: reason,
    decidedAtISO: new Date().toISOString(),
    decidedBy: auth.currentUser.email,
  });
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
  // The photo from the application becomes the account's profile photo (stored, not kept full size)
  const avatar = approved && app.avatar ? ((await storeMedia(app.avatar, 'avatars', 120_000).catch(() => '')) || '') : '';
  const batch = writeBatch(db);
  batch.update(doc(db, 'applications', app.uid), {
    status: approved ? 'approved' : 'rejected',
    verifiedBadge: decision === 'verify',
    rejectionReason: approved ? '' : reason,
    ...(app.verificationRequestStatus ? { verificationRequestStatus: '' } : {}),
    decidedAtISO: new Date().toISOString(),
    decidedBy: admin!.email,
  });
  batch.update(doc(db, 'users', app.uid), {
    role: approved ? app.role : 'buyer',
    verified: decision === 'verify',
    storeName: approved ? app.name || '' : '',
    ...(approved && app.phone ? { phone: app.phone } : {}),
    ...(approved && app.location ? { location: app.location } : {}),
    ...(avatar ? { avatar } : {}),
  });
  if (app.role === 'artisan') {
    const profileRef = doc(db, 'artisans', app.uid);
    if (approved && app.status === 'approved') {
      // Already listed: only the badge changes (keeps their jobs, reviews and availability)
      batch.set(profileRef, { verified: decision === 'verify' }, { merge: true });
    } else if (approved) {
      const profile = publicArtisanProfile(app, decision === 'verify');
      profile.avatar = avatar || (await storeMedia(profile.avatar, 'avatars', 120_000)) || '';
      profile.voiceIntroUrl = (await storeMedia(profile.voiceIntroUrl, 'voice', 0)) || '';
      profile.verifiedWorkPortfolio = await Promise.all(
        profile.verifiedWorkPortfolio.map(async (w) => ({ ...w, img: (await storeMedia(w.img, 'portfolio', 100_000)) || '' }))
      );
      batch.set(profileRef, profile, { merge: true });
    }
    else batch.delete(profileRef);
  }
  await batch.commit();
  // The Verified tag travels with each ad, so update the ads they already posted too
  await syncSellerAdsVerified(app.uid, decision === 'verify').catch((error) => reportClientError('verify-ads', error));
}

export interface AdminPartnerInput {
  role: 'seller' | 'artisan';
  sellerAccountType: 'individual' | 'shop';
  name: string;
  phone: string;
  region: string;
  cityNeighborhood: string;
  /** Seller: the categories they sell in. Artisan: unused */
  categories: string[];
  /** Artisan only */
  tradeSkill: string;
  experienceYears: string;
  inspectionFee: number;
}

/**
 * System admin only: makes an existing account a seller or artisan. Their application is filed
 * on their behalf and then approved through the same path as any other application, so the role,
 * the public artisan profile and their ads all update together. The Verified badge still needs
 * their Ghana Card documents (they can send them from their account afterwards).
 */
export async function makeUserPartner(user: UserProfileDoc, input: AdminPartnerInput): Promise<void> {
  const admin = auth.currentUser;
  if (!admin?.email || admin.email.toLowerCase() !== SYSTEM_ADMIN_EMAIL) {
    throw new Error('Only the system admin can make someone a seller or artisan.');
  }
  const existing = await getDoc(doc(db, 'applications', user.id));
  if (existing.exists() && existing.data().status === 'pending') {
    throw new Error('This person already has an application waiting. Review it in the Admin Control Dashboard.');
  }
  const isArtisan = input.role === 'artisan';
  const isShop = !isArtisan && input.sellerAccountType === 'shop';
  const location = [input.cityNeighborhood.trim(), input.region].filter(Boolean).join(', ');
  const record = stripUndefined({
    id: user.id,
    uid: user.id,
    name: input.name.trim(),
    legalName: user.name || input.name.trim(),
    email: user.email || '',
    avatar: user.avatar || '',
    role: input.role,
    sellerAccountType: isShop ? 'shop' : 'individual',
    tradeCategory: isArtisan ? input.tradeSkill : input.categories.join(', '),
    tradeSkill: isArtisan ? input.tradeSkill : undefined,
    experienceYears: isArtisan ? input.experienceYears : undefined,
    inspectionFee: isArtisan ? Math.max(0, input.inspectionFee || 0) : undefined,
    ghanaCardId: '',
    idVerificationSkipped: true,
    phone: input.phone,
    allowWhatsApp: false,
    region: input.region,
    cityNeighborhood: input.cityNeighborhood.trim(),
    location,
    shopAddress: isShop ? location : undefined,
    businessOrCert: 'Added by the system admin',
    isCertSkipped: true,
    confirmSafeTradePayout: true,
    policeClearanceStatus: isArtisan ? 'skipped' : undefined,
    serviceCoverageAreas: isArtisan ? [input.cityNeighborhood.trim() || input.region] : undefined,
    languagesSpoken: isArtisan ? [] : undefined,
    servicesAndPricing: isArtisan ? [] : undefined,
    verifiedWorkPortfolio: isArtisan ? [] : undefined,
    addedBySystemAdmin: true,
    status: 'pending',
    verifiedBadge: false,
    rejectionReason: '',
    submittedAtISO: new Date().toISOString(),
  }) as StoredApplication;
  await setDoc(doc(db, 'applications', user.id), record);
  await decideApplication(record, 'approve');
}

/** Admins: sets (or clears) the Verified tag on every ad a seller has posted. */
async function syncSellerAdsVerified(sellerId: string, verified: boolean): Promise<void> {
  const ads = await getDocs(query(collection(db, 'listings'), where('sellerId', '==', sellerId)));
  const stale = ads.docs.filter((ad) => Boolean(ad.data().isVerifiedDeal) !== verified || Boolean(ad.data().seller?.isVerified) !== verified);
  for (let i = 0; i < stale.length; i += 400) {
    const batch = writeBatch(db);
    for (const ad of stale.slice(i, i + 400)) batch.update(ad.ref, { isVerifiedDeal: verified, 'seller.isVerified': verified });
    await batch.commit();
  }
}

// ---------------------------------------------------------------------------
// Artisans: public profiles (/artisans/{uid}), bookings and reviews
// ---------------------------------------------------------------------------

export type ArtisanCategory =
  | 'carpenters' | 'electricians' | 'plumbers' | 'ac-repair' | 'masons' | 'painters' | 'mechanics' | 'welders'
  | 'jobs' | 'art-crafts' | 'photography' | 'tailoring' | 'catering' | 'electronics' | 'other';

/** Directory category from the trade the artisan entered. Order matters: the most specific trades are checked first. */
export function artisanCategoryFor(trade: string): ArtisanCategory {
  const t = trade.toLowerCase();
  if (/photo|video|camera|drone/.test(t)) return 'photography';
  if (/appliance|phone|laptop|electronic|computer|\btech/.test(t)) return 'electronics';
  if (/\bac\b|air.?con|refrigerat|fridge/.test(t)) return 'ac-repair';
  if (/mechanic|auto|vehicle|diagnos|vulcani/.test(t)) return 'mechanics';
  if (/weld|metal|fabricat|alumin|glazing/.test(t)) return 'welders';
  if (/carpent|wood|furniture|joiner|upholster/.test(t)) return 'carpenters';
  if (/mason|tiling|tile|block|concrete|terrazzo|epoxy|roof|paver|build/.test(t)) return 'masons';
  if (/paint|decor|plaster|ceiling|gypsum/.test(t)) return 'painters';
  if (/electric|solar|wiring|inverter|generator|cctv|intercom/.test(t)) return 'electricians';
  if (/plumb|drain|pipe|borehole|water pump/.test(t)) return 'plumbers';
  if (/tailor|sew|fashion|dress/.test(t)) return 'tailoring';
  if (/cater|cook|food|chef|bak/.test(t)) return 'catering';
  if (/\bart\b|artist|craft|sculpt|bead|pottery|weav|kente/.test(t)) return 'art-crafts';
  if (/\bjobs?\b|labou?r|cleaner|driver|security guard|nanny|househelp|domestic/.test(t)) return 'jobs';
  return 'other';
}

export interface ArtisanProfileDoc {
  id: string;
  name: string;
  avatar: string;
  headline: string;
  tradeSkill: string;
  category: ArtisanCategory;
  location: string;
  serviceCoverageAreas: string[];
  languagesSpoken: string[];
  servicesAndPricing: Array<{ title: string; desc: string; price: string }>;
  verifiedWorkPortfolio: Array<{ title: string; tag: string; sub: string; img: string }>;
  inspectionFee: number;
  responseTime: string;
  experienceYears: string;
  bio: string;
  phone: string;
  whatsapp: string;
  voiceIntroUrl: string;
  verified: boolean;
  policeCleared: boolean;
  available: boolean;
  jobsCompleted: number;
  lastCompletedBookingId: string;
  approvedAtISO: string;
}

/** Only the public parts of an artisan application (never ID numbers or ID photos). */
function publicArtisanProfile(app: Record<string, any>, verified: boolean): ArtisanProfileDoc {
  const trade = app.tradeSkill || app.tradeCategory || '';
  return {
    id: app.uid,
    name: app.name || app.legalName || '',
    avatar: app.avatar || '',
    headline: app.headline || '',
    tradeSkill: trade,
    category: artisanCategoryFor(trade),
    location: app.location || '',
    serviceCoverageAreas: app.serviceCoverageAreas || [],
    languagesSpoken: app.languagesSpoken || [],
    servicesAndPricing: (app.servicesAndPricing || []).map((s: any) => ({ title: s.title || '', desc: s.desc || '', price: s.price || '' })),
    verifiedWorkPortfolio: (app.verifiedWorkPortfolio || []).map((w: any) => ({ title: w.title || '', tag: w.tag || '', sub: w.sub || '', img: w.img || '' })),
    inspectionFee: Number(app.inspectionFee) || 0,
    responseTime: app.responseTime || '',
    experienceYears: app.experienceYears || '',
    bio: app.sellerBio || '',
    phone: app.phone || '',
    whatsapp: app.allowWhatsApp ? app.whatsapp || app.phone || '' : '',
    voiceIntroUrl: typeof app.voiceIntroUrl === 'string' ? app.voiceIntroUrl : '',
    verified,
    policeCleared: app.policeClearanceStatus === 'cleared',
    available: true,
    jobsCompleted: 0,
    lastCompletedBookingId: '',
    approvedAtISO: new Date().toISOString(),
  };
}

/** All approved artisans (public). */
export function watchArtisans(callback: (artisans: ArtisanProfileDoc[]) => void): () => void {
  return onSnapshot(
    collection(db, 'artisans'),
    (snap) => callback(snap.docs.map((d) => d.data() as ArtisanProfileDoc)),
    (error) => console.warn('Could not load artisans', error)
  );
}

/** An artisan updates the parts of their public profile they control. */
export function updateMyArtisanProfile(
  data: Partial<Pick<ArtisanProfileDoc, 'available' | 'inspectionFee' | 'bio' | 'phone' | 'whatsapp' | 'avatar' | 'responseTime'>>
): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return Promise.reject(new Error('Please log in again.'));
  const write = async () => {
    const update = { ...data };
    if (update.avatar?.startsWith('data:image')) update.avatar = await storeMedia(update.avatar, 'avatars', 150_000);
    await updateDoc(doc(db, 'artisans', uid), stripUndefined(update));
  };
  return write();
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled' | 'Declined';

export interface BookingDoc {
  id: string;
  referenceCode: string;
  artisanId: string;
  artisanName: string;
  artisanAvatar: string;
  artisanPhone: string;
  trade: string;
  service: string;
  bookingDate: string;
  bookingWindow: string;
  location: string;
  inspectionFee: string;
  notes: string;
  propertyType?: string;
  urgency?: 'Immediate' | 'High' | 'Normal';
  workImages: string[];
  voiceNoteUrl?: string;
  voiceNoteDuration?: number;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAvatar: string;
  status: BookingStatus;
  createdAtISO: string;
  updatedAtISO: string;
}

/** A customer books an artisan. The request stays Pending until the artisan accepts it. */
export async function createBooking(
  input: Omit<BookingDoc, 'id' | 'referenceCode' | 'customerId' | 'status' | 'createdAtISO' | 'updatedAtISO'>
): Promise<BookingDoc> {
  const user = auth.currentUser;
  if (!user) throw new Error('Please log in to book an artisan.');
  if (user.uid === input.artisanId) throw new Error('You cannot book yourself.');
  const ref = doc(collection(db, 'bookings'));
  const voice = await storeMedia(input.voiceNoteUrl, 'bookings', 0);
  const budget = Math.floor((850_000 - (voice?.startsWith('data:') ? voice.length : 0)) / Math.max(1, input.workImages.length));
  const workImages = (await Promise.all(
    input.workImages.map((src) => storeMedia(src, 'bookings', Math.max(60_000, budget)))
  )) as string[];
  const now = new Date().toISOString();
  const booking: BookingDoc = stripUndefined({
    ...input,
    workImages,
    voiceNoteUrl: voice,
    voiceNoteDuration: voice ? input.voiceNoteDuration : undefined,
    id: ref.id,
    referenceCode: `HRK-${ref.id.slice(0, 6).toUpperCase()}`,
    customerId: user.uid,
    status: 'Pending',
    createdAtISO: now,
    updatedAtISO: now,
  });
  await setDoc(ref, booking);
  return booking;
}

function watchBookingsWhere(field: 'customerId' | 'artisanId', uid: string, callback: (bookings: BookingDoc[]) => void) {
  return onSnapshot(
    query(collection(db, 'bookings'), where(field, '==', uid)),
    (snap) =>
      callback(snap.docs.map((d) => d.data() as BookingDoc).sort((a, b) => b.createdAtISO.localeCompare(a.createdAtISO))),
    (error) => console.warn('Could not load bookings', error)
  );
}

/** Bookings the user made as a customer. */
export const watchMyBookings = (uid: string, cb: (b: BookingDoc[]) => void) => watchBookingsWhere('customerId', uid, cb);
/** Bookings customers made with this artisan. */
export const watchArtisanBookings = (uid: string, cb: (b: BookingDoc[]) => void) => watchBookingsWhere('artisanId', uid, cb);

/**
 * Changes a booking's status. The artisan accepts, declines, starts and completes;
 * the customer can cancel or ask again. Completing a job adds one to the artisan's job count.
 */
export async function setBookingStatus(booking: BookingDoc, status: BookingStatus): Promise<void> {
  const batch = writeBatch(db);
  batch.update(doc(db, 'bookings', booking.id), { status, updatedAtISO: new Date().toISOString() });
  if (status === 'Completed') {
    batch.update(doc(db, 'artisans', booking.artisanId), {
      jobsCompleted: increment(1),
      lastCompletedBookingId: booking.id,
    });
  }
  await batch.commit();
}

export interface ReviewDoc {
  id: string;
  bookingId: string;
  artisanId: string;
  customerId: string;
  customerName: string;
  rating: number;
  text: string;
  createdAtISO: string;
}

/** All reviews (public), used for artisan ratings. */
export function watchReviews(callback: (reviews: ReviewDoc[]) => void): () => void {
  return onSnapshot(
    collection(db, 'reviews'),
    (snap) => callback(snap.docs.map((d) => d.data() as ReviewDoc)),
    (error) => console.warn('Could not load reviews', error)
  );
}

/** The customer reviews a completed booking (one review per booking). */
export async function submitReview(booking: BookingDoc, rating: number, text: string, customerName: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please log in to leave a review.');
  const review: ReviewDoc = {
    id: booking.id,
    bookingId: booking.id,
    artisanId: booking.artisanId,
    customerId: user.uid,
    customerName,
    rating: Math.min(5, Math.max(1, Math.round(rating))),
    text: text.trim().slice(0, 1000),
    createdAtISO: new Date().toISOString(),
  };
  await setDoc(doc(db, 'reviews', booking.id), review);
}

/**
 * Stores a photo (or voice note) taken on the device. With Cloudinary set up it is uploaded and
 * the public URL is returned; otherwise it stays inline as a shrunk data: URL (the 1 MB Firestore
 * document limit then applies, so `inlinePhotoBudget` keeps photos small).
 */
async function storeMedia(src: string | undefined, folder: string, inlinePhotoBudget: number): Promise<string | undefined> {
  if (!src) return src;
  if (src.startsWith('blob:')) src = await blobToDataUrl(await (await fetch(src)).blob());
  if (!src.startsWith('data:')) return src; // already a URL
  const isImage = src.startsWith('data:image');
  if (isCloudinaryConfigured()) {
    try {
      return await uploadMedia(isImage ? await compressImage(src, 450_000) : src, folder);
    } catch (error) {
      // Some phone networks block the media server: keep the file in the record itself instead
      console.warn('Media upload failed; saving it inline instead', error);
      reportClientError(`upload-${folder}`, error);
    }
  }
  return isImage ? compressImage(src, inlinePhotoBudget) : src;
}

/**
 * System admin (or an admin given branding access): replaces the app bar logo or the Welcome page picture for everyone.
 * Pass an empty image to go back to the built-in one.
 */
export async function saveBrandingImage(field: 'logoUrl' | 'welcomeImageUrl', image: string): Promise<void> {
  const email = requirePermission('branding', 'You do not have permission to change the app branding.');
  let url = '';
  if (image) {
    // PNG logos are uploaded as they are so a transparent background stays transparent
    const isPng = image.startsWith('data:image/png');
    if (isPng && isCloudinaryConfigured()) url = await uploadMedia(image, 'branding').catch(() => '');
    if (!url) url = isPng && image.length < 550_000 ? image : (await storeMedia(image, 'branding', 150_000)) || '';
  }
  await setDoc(
    doc(db, 'settings', 'branding'),
    { [field]: url, updatedAtISO: new Date().toISOString(), updatedBy: email },
    { merge: true }
  );
}

/** System admin (or an admin given branding access): sets the app's theme colours (#RRGGBB) for everyone. */
export async function saveBrandingColors(colors: Partial<Record<ThemeColorKey, string>>): Promise<void> {
  const email = requirePermission('branding', 'You do not have permission to change the app branding.');
  for (const color of Object.values(colors)) {
    if (!/^#[0-9a-f]{6}$/i.test(color || '')) throw new Error('Each colour must look like #25D366.');
  }
  const upper = Object.fromEntries(Object.entries(colors).map(([key, color]) => [key, color!.toUpperCase()]));
  await setDoc(
    doc(db, 'settings', 'branding'),
    { ...upper, updatedAtISO: new Date().toISOString(), updatedBy: email },
    { merge: true }
  );
}

function requireCategoryAccess(): string {
  return requirePermission('categories', 'You do not have permission to change categories.');
}

/** Admin with category access: new photo for a category (pass '' to go back to the original photo). */
export async function setCategoryImage(slug: string, image: string): Promise<void> {
  requireCategoryAccess();
  const url = image ? (await storeMedia(image, 'categories', 30_000)) || '' : '';
  await setDoc(doc(db, 'categories', slug), { slug, image: url, updatedAtISO: new Date().toISOString() }, { merge: true });
}

/** Admin with category access: adds a new category for everyone. Returns its slug. */
export async function addCategory(name: string, subcategories: string[], image: string, takenSlugs: string[]): Promise<string> {
  requireCategoryAccess();
  const clean = name.trim().replace(/\s+/g, ' ').slice(0, 40);
  if (clean.length < 2) throw new Error('Enter a category name.');
  const base = clean.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40) || 'category';
  let slug = base;
  for (let n = 2; takenSlugs.includes(slug); n++) slug = `${base}-${n}`;
  const url = image ? (await storeMedia(image, 'categories', 30_000)) || '' : '';
  await setDoc(doc(db, 'categories', slug), {
    slug,
    name: clean,
    image: url,
    subcategories: subcategories.map((s) => s.trim()).filter(Boolean).slice(0, 20),
    custom: true,
    order: Date.now(),
    updatedAtISO: new Date().toISOString(),
  });
  return slug;
}

/** Admin with category access: moves every ad in one category to another. Returns how many ads were moved. */
export async function moveCategoryAds(fromSlug: string, to: { slug: string; name: string; subcategories: string[] }): Promise<number> {
  requireCategoryAccess();
  if (fromSlug === to.slug) return 0;
  const ads = await getDocs(query(collection(db, 'listings'), where('category', '==', fromSlug)));
  for (let i = 0; i < ads.docs.length; i += 400) {
    const batch = writeBatch(db);
    for (const ad of ads.docs.slice(i, i + 400)) {
      batch.update(ad.ref, { category: to.slug, categoryName: to.name, subcategory: to.subcategories[0] || 'General' });
    }
    await batch.commit();
  }
  return ads.size;
}

/**
 * Admin with category access: deletes a category. A category the admin added is deleted for good; a built-in
 * one is hidden for everyone and can be restored later.
 */
export async function deleteCategory(slug: string, isCustom: boolean): Promise<void> {
  requireCategoryAccess();
  if (isCustom) {
    await deleteDoc(doc(db, 'categories', slug));
    return;
  }
  await setDoc(doc(db, 'categories', slug), { slug, hidden: true, updatedAtISO: new Date().toISOString() }, { merge: true });
}

/** Admin with category access: brings back a built-in category that was deleted. */
export async function restoreCategory(slug: string): Promise<void> {
  requireCategoryAccess();
  await setDoc(doc(db, 'categories', slug), { slug, hidden: false, updatedAtISO: new Date().toISOString() }, { merge: true });
}

/** Admin with category access: removes a category they added (built-in categories can't be removed). */
export async function removeCategory(slug: string): Promise<void> {
  requireCategoryAccess();
  await deleteDoc(doc(db, 'categories', slug));
}

/**
 * Admin with banner access: saves a Home banner (new or edited). PNG pictures keep their
 * transparent background, like the built-in illustration. Returns the banner's id.
 */
export async function saveBanner(banner: Omit<BannerDoc, 'updatedAtISO'>): Promise<string> {
  requirePermission('banners', 'You do not have permission to change banners.');
  let image = banner.image || '';
  // Banner pictures are already shrunk on the phone, so they are saved with the banner itself:
  // no upload to wait for, and the banner shows for everyone as soon as it is saved
  if (image.startsWith('data:') && image.length >= 280_000) {
    image = (await storeMedia(image, 'banners', 200_000)) || '';
  }
  const id = banner.id || `banner-${Date.now().toString(36)}`;
  await setDoc(doc(db, 'banners', id), {
    ...banner,
    id,
    image,
    title: banner.title.trim().slice(0, 60),
    desc: banner.desc.trim().slice(0, 140),
    btnText: banner.btnText.trim().slice(0, 24),
    updatedAtISO: new Date().toISOString(),
  });
  return id;
}

/** Admin with banner access: moves a banner to a new place in the list (only its position is saved). */
export async function setBannerOrder(id: string, order: number, builtIn: boolean): Promise<void> {
  requirePermission('banners', 'You do not have permission to change banners.');
  await setDoc(doc(db, 'banners', id), { id, order, ...(builtIn ? { builtIn: true } : {}), updatedAtISO: new Date().toISOString() }, { merge: true });
}

/** Admin with banner access: deletes a banner they added, or puts one of Haraka's banners back the way it was. */
export async function deleteBanner(id: string): Promise<void> {
  requirePermission('banners', 'You do not have permission to change banners.');
  await deleteDoc(doc(db, 'banners', id));
}

/** Admin with banner access: deletes one of Haraka's starting banners (it can be restored). */
export async function setBuiltInBannerHidden(id: string, hidden: boolean): Promise<void> {
  requirePermission('banners', 'You do not have permission to change banners.');
  await setDoc(doc(db, 'banners', id), { id, builtIn: true, hidden, updatedAtISO: new Date().toISOString() });
}

// ---------------------------------------------------------------------------
// System admin tools: every account, and problems reported from phones
// ---------------------------------------------------------------------------

/** Every account on Haraka, newest first (admins only; the system admin's tools use it). */
export function watchAllUsers(callback: (users: UserProfileDoc[]) => void): () => void {
  return onSnapshot(
    collection(db, 'users'),
    (snap) =>
      callback(
        snap.docs
          .map((d) => ({ ...(d.data() as UserProfileDoc), id: d.id }))
          .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      ),
    (error) => console.warn('Could not load users', error)
  );
}

export interface ClientErrorDoc {
  id: string;
  uid: string;
  where: string;
  code: string;
  message: string;
  userAgent: string;
  atISO: string;
}

/** Problems recorded on people's phones (failed uploads and the like), newest first. Admins only. */
export function watchClientErrors(callback: (errors: ClientErrorDoc[]) => void): () => void {
  return onSnapshot(
    query(collection(db, 'clientErrors'), orderBy('atISO', 'desc'), limit(100)),
    (snap) => callback(snap.docs.map((d) => ({ ...(d.data() as ClientErrorDoc), id: d.id }))),
    (error) => console.warn('Could not load problem reports', error)
  );
}

/** Admins: removes problem reports that were looked at. */
export async function clearClientErrors(ids: string[]): Promise<void> {
  for (let i = 0; i < ids.length; i += 400) {
    const batch = writeBatch(db);
    ids.slice(i, i + 400).forEach((id) => batch.delete(doc(db, 'clientErrors', id)));
    await batch.commit();
  }
}

/**
 * Records why something failed on a user's phone (error text and device type only), so problems
 * that can't be reproduced elsewhere can be fixed. Admins read these in the database.
 */
export function reportClientError(where: string, error: unknown): void {
  const user = auth.currentUser;
  if (!user) return;
  const e = error as { code?: unknown; message?: unknown } | null;
  addDoc(collection(db, 'clientErrors'), {
    uid: user.uid,
    where: where.slice(0, 60),
    code: String(e?.code ?? '').slice(0, 100),
    message: String(e?.message ?? error).slice(0, 500),
    userAgent: (typeof navigator !== 'undefined' ? navigator.userAgent : '').slice(0, 300),
    atISO: new Date().toISOString(),
  }).catch(() => undefined);
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
  // Newest 300 ads; older ones are still reachable by direct link
  const q = query(collection(db, 'listings'), orderBy('createdAtISO', 'desc'), limit(300));
  return onSnapshot(
    q,
    (snap) =>
      callback(
        snap.docs.map((d) => normalizeListing(d.id, d.data() as Partial<StoredListing>))
      ),
    (error) => {
      console.warn('Could not load listings', error);
      onError?.(error);
    }
  );
}

/** Every ad on Haraka, newest first, with no limit (the system admin's All Ads page). */
export function watchAllListings(callback: (listings: StoredListing[]) => void): () => void {
  return onSnapshot(
    query(collection(db, 'listings'), orderBy('createdAtISO', 'desc')),
    (snap) => callback(snap.docs.map((d) => normalizeListing(d.id, d.data() as Partial<StoredListing>))),
    (error) => console.warn('Could not load all ads', error)
  );
}

/**
 * Fills in any missing fields so one incomplete ad (e.g. written by an older app version)
 * can never break the screens that list ads.
 */
function normalizeListing(id: string, data: Partial<StoredListing>): StoredListing {
  const createdAtISO = data.createdAtISO || new Date(0).toISOString();
  const sellerId = data.sellerId || '';
  return {
    description: '',
    price: 0,
    currency: 'GH₵',
    negotiable: false,
    category: 'general',
    categoryName: 'General',
    subcategory: '',
    condition: 'Used - Good',
    featured: false,
    isVerifiedDeal: false,
    views: 0,
    likes: 0,
    deliveryAvailable: false,
    specifications: {},
    tags: [],
    ...data,
    id,
    title: data.title || 'Untitled ad',
    images: Array.isArray(data.images) ? data.images : [],
    location: { city: data.location?.city || '', neighborhood: data.location?.neighborhood || '' },
    seller: {
      id: sellerId,
      name: 'Seller',
      avatar: '',
      isVerified: false,
      memberSince: '',
      rating: 0,
      reviewCount: 0,
      phone: '',
      whatsapp: '',
      location: '',
      responseRate: '',
      responseTime: '',
      ...(data.seller || {}),
    },
    sellerId,
    createdAtISO,
    createdAt: timeAgo(createdAtISO),
  } as StoredListing;
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

  let audio = listing.audioDescriptionUrl;
  if (audio?.startsWith('blob:')) audio = await blobToDataUrl(await (await fetch(audio)).blob());
  audio = await storeMedia(audio, 'voice', 0);
  if (audio?.startsWith('data:') && audio.length > LISTING_MEDIA_BUDGET * 0.55) {
    throw new Error('Voice note is too long to save. Please record a shorter one.');
  }

  // The seller's photo travels with the ad: store it like any photo (a full-size camera photo
  // would otherwise push the ad over the 1 MB record limit and it could not be saved)
  const sellerAvatar = ((await storeMedia(listing.seller?.avatar, 'avatars', 40_000).catch(() => '')) || '') as string;

  // Without Cloudinary, photos share what is left of the 1 MB document
  const mediaLeft = LISTING_MEDIA_BUDGET - (audio?.startsWith('data:') ? audio.length : 0) - (sellerAvatar.startsWith('data:') ? sellerAvatar.length : 0);
  const photoBudget = Math.floor(mediaLeft / Math.max(1, listing.images.length));
  const images = (await Promise.all(listing.images.map((src) => storeMedia(src, 'listings', photoBudget)))) as string[];

  const stored: StoredListing = stripUndefined({
    ...listing,
    images,
    hasAudioDescription: Boolean(audio),
    audioDescriptionUrl: audio,
    seller: { ...listing.seller, id: uid, avatar: sellerAvatar },
    sellerId: uid,
    createdAtISO: new Date().toISOString(),
  });
  // Last safety net: if it is still too big, shrink the photos kept inside the ad and drop the seller photo
  if (JSON.stringify(stored).length > 1_000_000) {
    stored.seller.avatar = sellerAvatar.startsWith('data:') ? '' : sellerAvatar;
    const inline = stored.images.filter((src) => src.startsWith('data:')).length || 1;
    stored.images = await Promise.all(stored.images.map((src) => compressImage(src, Math.floor(mediaLeft / inline / 2))));
    if (JSON.stringify(stored).length > 1_000_000) {
      throw new Error('Your photos and voice note are too large together. Please remove a photo or record a shorter voice note.');
    }
  }
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

/** Reports a person (e.g. from a chat) to the admins. Shown in the admin reports list. */
export async function reportUser(person: { id: string; name: string }, reason: string, details: string) {
  const user = auth.currentUser;
  if (!user) throw new Error('Please log in to report someone.');
  const ref = doc(collection(db, 'reports'));
  await setDoc(ref, stripUndefined({
    id: ref.id,
    kind: 'user',
    listingId: '',
    listingTitle: `User: ${person.name}`,
    sellerId: person.id,
    reason,
    details: details.slice(0, 2000),
    reporterId: user.uid,
    reporterEmail: user.email || '',
    status: 'open',
    createdAtISO: new Date().toISOString(),
  }));
}

/** Blocks a person: they can no longer message or call you, and you no longer see their ads or chats. */
export async function blockUser(otherId: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Please log in again.');
  await updateDoc(doc(db, 'users', uid), { blockedUserIds: arrayUnion(otherId) });
}

export async function unblockUser(otherId: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Please log in again.');
  await updateDoc(doc(db, 'users', uid), { blockedUserIds: arrayRemove(otherId) });
}

export type ReportStatus = 'open' | 'resolved' | 'dismissed';

export interface ReportDoc {
  id: string;
  /** 'user' for a reported person; ads otherwise */
  kind?: 'user';
  listingId: string;
  listingTitle: string;
  sellerId?: string;
  reason: string;
  details: string;
  reporterId: string;
  reporterEmail: string;
  status: ReportStatus;
  createdAtISO: string;
  resolvedAtISO?: string;
  resolvedBy?: string;
  action?: string;
}

/** All user reports, newest first. Admins only. */
export function watchReports(callback: (reports: ReportDoc[]) => void): () => void {
  return onSnapshot(
    query(collection(db, 'reports'), orderBy('createdAtISO', 'desc'), limit(200)),
    (snap) => callback(snap.docs.map((d) => ({ ...(d.data() as ReportDoc), id: d.id }))),
    (error) => console.warn('Could not load reports', error)
  );
}

/** Closes a report. With removeAd, the reported ad is deleted first. Admins only. */
export async function resolveReport(report: ReportDoc, outcome: 'resolved' | 'dismissed', removeAd = false): Promise<void> {
  if (removeAd && report.listingId) await deleteDoc(doc(db, 'listings', report.listingId));
  await updateDoc(doc(db, 'reports', report.id), {
    status: outcome,
    resolvedAtISO: new Date().toISOString(),
    resolvedBy: auth.currentUser?.email || '',
    action: removeAd ? 'Ad removed' : outcome === 'dismissed' ? 'No action needed' : 'Resolved',
  });
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


// ---------------------------------------------------------------------------
// Chat between a buyer and a seller about one ad (/chats/{chatId}/messages)
// ---------------------------------------------------------------------------

export interface ChatPerson {
  name: string;
  avatar: string;
  phone: string;
  isVerified: boolean;
}

export interface ChatDoc {
  id: string;
  listingId: string;
  listingTitle: string;
  listingPrice: number;
  listingCurrency: string;
  listingImage: string;
  buyerId: string;
  sellerId: string;
  participants: string[];
  people: Record<string, ChatPerson>;
  lastMessage: string;
  lastMessageAtISO: string;
  lastSenderId: string;
  unread: Record<string, number>;
  createdAtISO: string;
  /** When each person deleted the conversation; they only see messages sent after that */
  deletedAt?: Record<string, string>;
}

export interface ChatMessageDoc {
  id: string;
  senderId: string;
  text: string;
  createdAtISO: string;
  isOffer?: boolean;
  offerAmount?: number;
  offerStatus?: 'pending' | 'accepted';
  /** People who deleted this message for themselves only */
  hiddenFor?: string[];
}

/** One conversation per buyer per ad. */
export function chatIdFor(listingId: string, buyerId: string): string {
  return `${listingId}__${buyerId}`;
}

/** Opens the buyer's conversation about an ad, creating it the first time. Returns its id. */
export async function openChat(input: {
  listing: { id: string; title: string; price: number; currency: string; image: string; sellerId: string };
  seller: ChatPerson;
  me: ChatPerson;
}): Promise<string> {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Please log in to message the seller.');
  if (uid === input.listing.sellerId) throw new Error('This is your own profile or ad.');
  const id = chatIdFor(input.listing.id, uid);
  const ref = doc(db, 'chats', id);
  const existing = await getDoc(ref);
  if (!existing.exists()) {
    const now = new Date().toISOString();
    const chat: ChatDoc = {
      id,
      listingId: input.listing.id,
      listingTitle: input.listing.title,
      listingPrice: input.listing.price,
      listingCurrency: input.listing.currency,
      listingImage: input.listing.image,
      buyerId: uid,
      sellerId: input.listing.sellerId,
      participants: [uid, input.listing.sellerId],
      people: { [uid]: input.me, [input.listing.sellerId]: input.seller },
      lastMessage: '',
      lastMessageAtISO: now,
      lastSenderId: '',
      unread: { [uid]: 0, [input.listing.sellerId]: 0 },
      createdAtISO: now,
    };
    await setDoc(ref, stripUndefined(chat));
  }
  return id;
}

/** All conversations the user is part of, most recent first. */
export function watchMyChats(uid: string, callback: (chats: ChatDoc[]) => void): () => void {
  return onSnapshot(
    query(collection(db, 'chats'), where('participants', 'array-contains', uid)),
    (snap) =>
      callback(
        snap.docs
          .map((d) => d.data() as ChatDoc)
          .sort((a, b) => b.lastMessageAtISO.localeCompare(a.lastMessageAtISO))
      ),
    (error) => console.warn('Could not load chats', error)
  );
}

export function watchChatMessages(chatId: string, callback: (messages: ChatMessageDoc[]) => void): () => void {
  return onSnapshot(
    query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAtISO', 'asc')),
    (snap) => callback(snap.docs.map((d) => d.data() as ChatMessageDoc)),
    (error) => console.warn('Could not load messages', error)
  );
}

export async function sendChatMessage(chat: ChatDoc, message: { text: string; isOffer?: boolean; offerAmount?: number }) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Please log in to send messages.');
  const otherId = chat.participants.find((p) => p !== uid)!;
  const ref = doc(collection(db, 'chats', chat.id, 'messages'));
  const now = new Date().toISOString();
  const batch = writeBatch(db);
  batch.set(ref, stripUndefined({
    id: ref.id,
    senderId: uid,
    text: message.text.slice(0, 2000),
    createdAtISO: now,
    isOffer: Boolean(message.isOffer),
    offerAmount: message.isOffer ? message.offerAmount : undefined,
    offerStatus: message.isOffer ? 'pending' : undefined,
  }));
  batch.update(doc(db, 'chats', chat.id), {
    lastMessage: message.isOffer && message.offerAmount
      ? `Offer: ${chat.listingCurrency} ${message.offerAmount.toLocaleString()}`
      : message.text.slice(0, 200),
    lastMessageAtISO: now,
    lastSenderId: uid,
    [`unread.${otherId}`]: increment(1),
  });
  await batch.commit();
}

/** The person who received an offer accepts it; a confirmation message is added to the chat. */
export async function acceptOffer(chat: ChatDoc, messageId: string, amount: number) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Please log in again.');
  const batch = writeBatch(db);
  batch.update(doc(db, 'chats', chat.id, 'messages', messageId), { offerStatus: 'accepted' });
  await batch.commit();
  await sendChatMessage(chat, {
    text: `🎉 Offer of ${chat.listingCurrency} ${amount.toLocaleString()} accepted! Let's agree on a safe public meetup point and time.`,
  });
}

/** Deletes your own message for both people. */
export async function deleteMessageForEveryone(chat: ChatDoc, messageId: string, wasLastMessage: boolean) {
  await deleteDoc(doc(db, 'chats', chat.id, 'messages', messageId));
  if (wasLastMessage) {
    await updateDoc(doc(db, 'chats', chat.id), { lastMessage: 'Message deleted' });
  }
}

/** Hides a message from your own view of the chat only. */
export async function deleteMessageForMe(chatId: string, messageId: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Please log in again.');
  await updateDoc(doc(db, 'chats', chatId, 'messages', messageId), { hiddenFor: arrayUnion(uid) });
}

/** Removes a conversation from your Messages. It comes back (empty) if a new message arrives. */
export async function deleteChatForMe(chatId: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) throw new Error('Please log in again.');
  await updateDoc(doc(db, 'chats', chatId), { [`deletedAt.${uid}`]: new Date().toISOString(), [`unread.${uid}`]: 0 });
}

export async function markChatRead(chatId: string) {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  await updateDoc(doc(db, 'chats', chatId), { [`unread.${uid}`]: 0 });
}

// ---------------------------------------------------------------------------
// Push notification tokens (/pushTokens/{uid}): one phone per account, the latest login wins
// ---------------------------------------------------------------------------

export async function savePushToken(token: string): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  await setDoc(doc(db, 'pushTokens', uid), { token, updatedAtISO: new Date().toISOString() });
}

/** Stops notifications to this phone (called when signing out). */
export async function clearPushToken(): Promise<void> {
  const uid = auth.currentUser?.uid;
  if (!uid) return;
  await deleteDoc(doc(db, 'pushTokens', uid));
}

/**
 * Admins' accounts that receive "new application / verification request" notifications on their
 * phones (/settings/adminPush). Admins add themselves when they sign in; anyone who is no longer
 * an admin takes themselves off the list.
 */
export async function syncAdminPushList(uid: string, isAdmin: boolean): Promise<void> {
  const ref = doc(db, 'settings', 'adminPush');
  const snap = await getDoc(ref);
  const listed = snap.exists() && ((snap.data().uids as string[]) || []).includes(uid);
  if (isAdmin && !listed) await setDoc(ref, { uids: arrayUnion(uid) }, { merge: true });
  if (!isAdmin && listed) await updateDoc(ref, { uids: arrayRemove(uid) });
}

/** Accounts of the admins to notify about new applications and verification requests. */
export async function getAdminPushUids(): Promise<string[]> {
  const snap = await getDoc(doc(db, 'settings', 'adminPush'));
  return snap.exists() ? ((snap.data().uids as string[]) || []) : [];
}

export async function getPushToken(uid: string): Promise<string | null> {
  const snap = await getDoc(doc(db, 'pushTokens', uid));
  return snap.exists() ? (snap.data().token as string) : null;
}
