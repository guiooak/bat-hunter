import { beforeEach, describe, expect, it, vi } from 'vitest';

const auth = vi.hoisted(() => ({
  instance: { currentUser: null as null | Record<string, unknown> },
  signInWithPopup: vi.fn(() => Promise.resolve()),
  signOut: vi.fn(() => Promise.resolve()),
  onAuthStateChanged: vi.fn(),
  reauthenticateWithPopup: vi.fn(() => Promise.resolve()),
  deleteUser: vi.fn(() => Promise.resolve()),
}));

vi.mock('./firebase-service', () => ({ firebaseApp: {} }));
vi.mock('firebase/auth', () => ({
  getAuth: () => auth.instance,
  GoogleAuthProvider: class {},
  signInWithPopup: auth.signInWithPopup,
  signOut: auth.signOut,
  onAuthStateChanged: auth.onAuthStateChanged,
  reauthenticateWithPopup: auth.reauthenticateWithPopup,
  deleteUser: auth.deleteUser,
}));

import {
  deleteCurrentAuthUser,
  getAuthAccountInfo,
  observeAuth,
  reauthenticateCurrentUser,
  signInWithGoogle,
  signOutUser,
} from './auth-service';

const googleUser = {
  uid: 'u1',
  displayName: 'Ana Maria Silva',
  photoURL: 'https://photo',
  email: 'ana@example.com',
  providerData: [{ providerId: 'google.com' }],
  metadata: { creationTime: 'c', lastSignInTime: 'l' },
};

describe('auth service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    auth.instance.currentUser = null;
  });

  it('signs in with a Google popup and signs out', async () => {
    await signInWithGoogle();
    await signOutUser();

    expect(auth.signInWithPopup).toHaveBeenCalled();
    expect(auth.signOut).toHaveBeenCalled();
  });

  it('turns the Firebase user into a session with first and last names', () => {
    const cb = vi.fn();
    observeAuth(cb);
    const [, listener] = auth.onAuthStateChanged.mock.calls[0];

    listener(googleUser);
    expect(cb).toHaveBeenLastCalledWith({
      id: 'u1',
      name: 'Ana Maria Silva',
      firstName: 'Ana',
      lastName: 'Maria Silva',
      picture: 'https://photo',
    });

    listener({ uid: 'u2', displayName: null, photoURL: null });
    expect(cb).toHaveBeenLastCalledWith({
      id: 'u2',
      name: '',
      firstName: '',
      lastName: '',
      picture: '',
    });

    listener(null);
    expect(cb).toHaveBeenLastCalledWith(null);
  });

  it('describes the signed-in account for the data export', () => {
    expect(getAuthAccountInfo()).toEqual({
      email: null,
      provider: null,
      createdAt: null,
      lastSignInAt: null,
    });

    auth.instance.currentUser = googleUser;
    expect(getAuthAccountInfo()).toEqual({
      email: 'ana@example.com',
      provider: 'google.com',
      createdAt: 'c',
      lastSignInAt: 'l',
    });

    auth.instance.currentUser = {
      ...googleUser,
      email: null,
      providerData: [],
      metadata: {},
    };
    expect(getAuthAccountInfo()).toEqual({
      email: null,
      provider: null,
      createdAt: null,
      lastSignInAt: null,
    });
  });

  it('confirms the sign-in and deletes the user, only when signed in', async () => {
    await expect(reauthenticateCurrentUser()).rejects.toThrow('Not signed in');
    await expect(deleteCurrentAuthUser()).rejects.toThrow('Not signed in');

    auth.instance.currentUser = googleUser;
    await reauthenticateCurrentUser();
    await deleteCurrentAuthUser();

    expect(auth.reauthenticateWithPopup).toHaveBeenCalledWith(
      googleUser,
      expect.anything()
    );
    expect(auth.deleteUser).toHaveBeenCalledWith(googleUser);
  });
});
