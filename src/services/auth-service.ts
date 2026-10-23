import {
  deleteUser,
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  reauthenticateWithPopup,
  signInWithPopup,
  signOut,
  type User,
} from 'firebase/auth';
import { firebaseApp } from './firebase-service';

const auth = getAuth(firebaseApp);
const googleProvider = new GoogleAuthProvider();

export type UserSessionType = {
  id?: string;
  firstName?: string;
  lastName?: string;
  name?: string;
  picture?: string;
  lastPulseAt?: number;
  away?: boolean;
};

export type AuthStatusType = 'loading' | 'authenticated' | 'unauthenticated';

function toUserSession(user: User | null): UserSessionType | null {
  if (!user) return null;

  const name = user.displayName || '';
  const [firstName = '', ...lastNames] = name.split(' ');

  return {
    id: user.uid,
    name,
    firstName,
    lastName: lastNames.join(' '),
    picture: user.photoURL || '',
  };
}

export async function signInWithGoogle() {
  await signInWithPopup(auth, googleProvider);
}

export async function signOutUser() {
  await signOut(auth);
}

// Calls back with the user (or null) and returns the unsubscribe function.
export function observeAuth(cb: (user: UserSessionType | null) => void) {
  return onAuthStateChanged(auth, (user) => cb(toUserSession(user)));
}

// What Firebase Authentication keeps about the account (for the data export).
export function getAuthAccountInfo() {
  const user = auth.currentUser;

  return {
    email: user?.email ?? null,
    provider: user?.providerData[0]?.providerId ?? null,
    createdAt: user?.metadata.creationTime ?? null,
    lastSignInAt: user?.metadata.lastSignInTime ?? null,
  };
}

// Deleting an account needs a recent sign-in: confirm it with Google first.
export async function reauthenticateCurrentUser() {
  if (!auth.currentUser) throw new Error('Not signed in');

  await reauthenticateWithPopup(auth.currentUser, googleProvider);
}

export async function deleteCurrentAuthUser() {
  if (!auth.currentUser) throw new Error('Not signed in');

  await deleteUser(auth.currentUser);
}
