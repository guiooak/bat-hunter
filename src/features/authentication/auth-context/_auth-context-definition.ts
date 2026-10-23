import { createContext } from 'react';
import { PresenceType } from 'src/models/user-model';
import { AuthStatusType, UserSessionType } from 'src/services/auth-service';

export const AuthContext = createContext({
  currentUser: null,
  status: 'loading',
  updatePresence: () => {},
  signIn: async () => {},
  signOut: async () => {},
} as {
  currentUser: UserSessionType | null;
  status: AuthStatusType;
  updatePresence: (presence: PresenceType) => void;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
});
