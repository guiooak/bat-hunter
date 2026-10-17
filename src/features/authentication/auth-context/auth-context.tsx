import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { setUserDataInFirebase } from 'src/models/user-model';
import {
  AuthStatusType,
  observeAuth,
  signInWithGoogle,
  signOutUser,
  UserSessionType,
} from 'src/services/auth-service';

import { AuthContext } from './_auth-context-definition';

export function AuthContextProvider({ children }: PropsWithChildren) {
  const [currentUser, setCurrentUser] = useState<UserSessionType | null>(null);
  const [status, setStatus] = useState<AuthStatusType>('loading');

  useEffect(
    () =>
      observeAuth((user) => {
        setCurrentUser(
          user && { ...user, away: false, lastPulseAt: Date.now() }
        );
        setStatus(user ? 'authenticated' : 'unauthenticated');
      }),
    []
  );

  const updatePresence = useCallback(
    (presence: Pick<UserSessionType, 'away' | 'lastPulseAt'>) => {
      setCurrentUser((prevCurrentUser) =>
        prevCurrentUser ? { ...prevCurrentUser, ...presence } : null
      );
    },
    []
  );

  // Update Firebase DB
  useEffect(() => {
    if (currentUser?.id) {
      setUserDataInFirebase({ ...currentUser, id: currentUser.id }).catch((e) =>
        console.error('AuthContextProvider::ERROR: user not saved', e)
      );
    }
  }, [currentUser]);

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
