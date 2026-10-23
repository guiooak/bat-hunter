import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import {
  PresenceType,
  setPrivateUserInFirebase,
  setPublicProfileInFirebase,
} from 'src/models/user-model';
import {
  AuthStatusType,
  observeAuth,
  signInWithGoogle,
  signOutUser,
  UserSessionType,
} from 'src/services/auth-service';

import { AuthContext } from './_auth-context-definition';

function logError(e: unknown) {
  console.error('AuthContextProvider::ERROR: user not saved', e);
}

export function AuthContextProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState<UserSessionType | null>(null);
  const [status, setStatus] = useState<AuthStatusType>('loading');

  useEffect(
    () =>
      observeAuth((user) => {
        setCurrentUser(user);
        setStatus(user ? 'authenticated' : 'unauthenticated');
      }),
    []
  );

  // Only the first name and the photo are stored: they are all the game
  // shows. The full name from Google stays in memory.
  const userId = currentUser?.id;
  const firstName = currentUser?.firstName || '';
  const picture = currentUser?.picture || '';

  useEffect(() => {
    if (!userId) return;

    setPrivateUserInFirebase({ id: userId, firstName, picture }).catch(
      logError
    );
    setPublicProfileInFirebase(userId, { firstName, picture }).catch(logError);
  }, [userId, firstName, picture]);

  // Presence is only published while playing multiplayer (see Pulse)
  const updatePresence = useCallback(
    (presence: PresenceType) => {
      if (!userId) return;

      setPublicProfileInFirebase(userId, presence).catch(logError);
    },
    [userId]
  );

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        status,
        updatePresence,
        signIn: signInWithGoogle,
        signOut: signOutUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
