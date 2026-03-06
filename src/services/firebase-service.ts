import { initializeApp } from 'firebase/app';
import {
  child,
  get,
  getDatabase,
  onValue,
  ref,
  set,
  update,
  remove,
} from 'firebase/database';

// TODO: Replace the following with your app's Firebase project configuration
// See: https://firebase.google.com/docs/web/learn-more#config-object
const firebaseConfig = {
  // ...
  // The value of `databaseURL` depends on the location of the database
  databaseURL: 'https://bat-hunter-game-default-rtdb.firebaseio.com/',
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Realtime Database and get a reference to the service
const database = getDatabase(app);

export function getData<T>(path: string): Promise<T | null> {
  return new Promise((resolve, reject) => {
    get(child(ref(database), path))
      .then((snapshot) => {
        if (snapshot.exists()) {
          resolve(snapshot.val());
        } else {
          resolve(null);
        }
      })
      .catch(reject);
  });
}

export function getReactively<T>(path: string, cb: (data: T) => void) {
  const theRef = ref(database, path);

  return onValue(theRef, (snapshot) => {
    const data = snapshot.val() as T;
    cb(data);
  });
}

export function setData(path: string, data: unknown) {
  return set(ref(database, path), data);
}

export function updateData(path: string, data: object) {
  return update(ref(database, path), data);
}

export function removeData(path: string) {
  return remove(ref(database, path));
}
