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
  const { currentUser } = useAuthContext();
  const { matchId } = useParams<{ matchId?: string }>();
  const currentUserId = currentUser?.id;

  // Each piece of state remembers which match (or opponent) it belongs to, so
  // switching match or user shows nothing stale without resetting it in an
  // effect
  const matchKey =
    matchId && currentUserId ? `${matchId}/${currentUserId}` : undefined;
  const [matchState, setMatchState] = useState<{
    key?: string;
    match?: MatchType;
    isPrivate?: boolean;
  }>({});

  useEffect(() => {
    if (!matchKey || !matchId) return;

    return getMatchDataReactivelyFromFirebase(
      matchId,
      (match) => setMatchState({ key: matchKey, match }),
      // Matches are private to their two players
      () => setMatchState({ key: matchKey, isPrivate: true })
    );
  }, [matchKey, matchId]);

  const current = matchState.key === matchKey ? matchState : {};
  const match = current.match;
  const isMatchPrivate = Boolean(current.isPrivate);

  const opponentUserId =
    match && currentUserId
      ? match.hostId === currentUserId
        ? match.guestId
        : match.hostId
      : undefined;
  const [opponentState, setOpponentState] = useState<{
    id?: string;
    user: UserSessionType | null;
  }>({ user: null });

  useEffect(() => {
    if (!opponentUserId) return;

    return getPublicProfileReactivelyFromFirebase(opponentUserId, (user) =>
      setOpponentState({ id: opponentUserId, user })
    );
  }, [opponentUserId]);

  const opponentUser =
    opponentUserId && opponentState.id === opponentUserId
      ? opponentState.user
      : null;

  return (
    <MultiPlayerContext.Provider
      value={{ opponentUser, match, isMatchPrivate }}
    >
      {children}
    </MultiPlayerContext.Provider>
  );
}
