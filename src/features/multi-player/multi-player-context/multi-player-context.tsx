import { PropsWithChildren, useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { useAuthContext } from 'src/features/authentication';
import {
  getMatchDataReactivelyFromFirebase,
  MatchType,
} from 'src/models/match-model';
import { getPublicProfileReactivelyFromFirebase } from 'src/models/user-model';
import { UserSessionType } from 'src/services/auth-service';
import { MultiPlayerContext } from './_multi-player-context-definition';

export function MultiPlayerContextProvider({ children }: PropsWithChildren) {
  const [opponentUser, setOpponentUser] = useState<UserSessionType | null>(
    null
  );
  const [match, setMatch] = useState<MatchType | undefined>(undefined);
  // Matches are private to their two players
  const [isMatchPrivate, setIsMatchPrivate] = useState(false);
  const { currentUser } = useAuthContext();
  const { matchId } = useParams<{ matchId?: string }>();
  const currentUserId = currentUser?.id;

  useEffect(() => {
    setIsMatchPrivate(false);

    if (!matchId || !currentUserId) {
      setMatch(undefined);
      return;
    }

    return getMatchDataReactivelyFromFirebase(matchId, setMatch, () =>
      setIsMatchPrivate(true)
    );
  }, [matchId, currentUserId]);

  const opponentUserId =
    match && currentUserId
      ? match.hostId === currentUserId
        ? match.guestId
        : match.hostId
      : undefined;

  useEffect(() => {
    if (!opponentUserId) {
      setOpponentUser(null);
      return;
    }

    return getPublicProfileReactivelyFromFirebase(
      opponentUserId,
      setOpponentUser
    );
  }, [opponentUserId]);

  return (
    <MultiPlayerContext.Provider
      value={{ opponentUser, match, isMatchPrivate }}
    >
      {children}
    </MultiPlayerContext.Provider>
  );
}
