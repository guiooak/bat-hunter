import { createContext } from 'react';
import { MatchType } from 'src/models/match-model';
import { UserSessionType } from 'src/services/authentication-service';

export const MultiPlayerContext = createContext({
  opponentUser: null,
  match: undefined,
} as {
  opponentUser: UserSessionType | null;
  match: MatchType | undefined;
});
