import { initializeApp } from 'firebase/app';
import {
  child,
  get,
  getDatabase,
  onValue,
  ref,
  set,
  update,
} from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// The single Firebase app instance, shared by the auth and database services.
export const firebaseApp = initializeApp(firebaseConfig);

const database = getDatabase(firebaseApp);

export async function getData<T>(path: string): Promise<T | null> {
  const snapshot = await get(child(ref(database), path));

  return snapshot.exists() ? (snapshot.val() as T) : null;
}

// Returns the unsubscribe function. Always call it on cleanup.
export function getReactively<T>(path: string, cb: (data: T) => void) {
  const theRef = ref(database, path);

  return onValue(
    theRef,
    (snapshot) => cb(snapshot.val() as T),
    (error) => console.error(`getReactively::ERROR on "${path}"`, error)
  );
}

export function setData(path: string, data: unknown) {
  return set(ref(database, path), data);
}

export function updateData(path: string, data: object) {
  return update(ref(database, path), data);
}
