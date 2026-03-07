import { createContext } from 'react';
import { UserSessionType } from 'src/services/authentication-service';

export const AuthContext = createContext({
  currentUser: {},
  setCurrentUser: () => {},
} as {
  currentUser: UserSessionType | null;
  setCurrentUser: (v: UserSessionType | null) => void;
});
