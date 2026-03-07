import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { setCurrentUserDataInFirebase } from 'src/models/user-model';
import {
  getCurrentUserSession,
  isLoggedIn,
} from 'src/services/authentication-service';
import { UserSessionType } from 'src/services/authentication-service';

import { AuthContext } from './_auth-context-definition';

export function AuthContextProvider({ children }: PropsWithChildren) {
  const [currentUser, _setCurrentUser] = useState<UserSessionType | null>(
    getCurrentUserSession()
  );

  const setCurrentUser = useCallback(
    (useSessionData: UserSessionType | null) => {
      if (!isLoggedIn()) return;

      if (!useSessionData) {
        _setCurrentUser(null);
        return;
      }

      _setCurrentUser((prevCurrentUser) => ({
        ...prevCurrentUser,
        ...useSessionData,
      }));
    },
    []
  );

  // Update Firebase DB
  useEffect(() => {
    if (currentUser) {
      setCurrentUserDataInFirebase(currentUser);
    }
  }, [currentUser]);

  return (
    <AuthContext.Provider value={{ currentUser, setCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}
