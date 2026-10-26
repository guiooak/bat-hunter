import { useMemo } from 'react';
import { Gutter, Modal, Text, Title } from 'src/components';
import { Gap } from 'src/components/gap';
import { useAuthContext } from 'src/features/authentication';
import { MatchType } from 'src/models/match-model';
import { GameType } from 'src/models/game-model';
import { calcAccuracy, calcFinalScore } from 'src/services/game-service';
import { buildArray } from 'src/services/array-service';
import { useMultiPlayerContext } from 'src/features/multi-player/multi-player-context';
import { useI18n } from 'src/i18n';

export function MultiPlayerGameHistoryModal({
  open,
  onClose,
  match,
}: {
  open: boolean;
  onClose: () => void;
  match?: MatchType;
}) {
  const { currentUser } = useAuthContext();
  const { t } = useI18n();
  const { opponentUser } = useMultiPlayerContext();
  const isCurrentUserTheHost = currentUser?.id === match?.hostId;

  function retrieveWinnerName(winnerId?: string) {
    if (winnerId === 'DRAW') return t.multi.sameScore;
    if (winnerId === currentUser?.id) return `${currentUser?.firstName} 🎉`;
    if (winnerId === opponentUser?.id) return `${opponentUser?.firstName} 🎉`;
    return t.multi.noWinner;
  }

  function getUserData(game: GameType, userType: 'MAIN' | 'OPPONENT') {
    const data =
      (isCurrentUserTheHost && userType === 'MAIN') ||
      (!isCurrentUserTheHost && userType === 'OPPONENT')
        ? game?.hostData
        : game?.guestData;

    return {
      kills: data?.killCounter || 0,
      shots: data?.shotCounter || 0,
      score:
        calcFinalScore(data?.shotCounter, data?.killCounter, data?.points) || 0,
    };
  }

  // Only played games count: a game that has not started (or is still
  // running) has no winner yet
  const gamesArray = useMemo(
    () =>
      buildArray(match?.games).filter((game) =>
        ['GAME_FINISHED', 'GAME_CLOSED'].includes(game.state || '')
      ),
    [match?.games]
  );

  const { currentWins, opponentWins } = useMemo(
    () =>
      gamesArray.reduce(
        (acc, game) => ({
          currentWins:
            acc.currentWins + (isWinner(game, currentUser?.id) ? 1 : 0),
          opponentWins:
            acc.opponentWins + (isWinner(game, opponentUser?.id) ? 1 : 0),
        }),
        { currentWins: 0, opponentWins: 0 }
      ),
    [gamesArray, currentUser?.id, opponentUser?.id]
  );

  return (
    <Modal open={open} onClose={onClose} header={t.multi.historyTitle}>
      {/* Starts at 0 x 0 as soon as the opponent joins */}
      <FinalRanking
        opponentWins={opponentWins}
        currentUserWins={currentWins}
        opponentName={opponentUser?.firstName}
        currentUserName={currentUser?.firstName}
      />
      {gamesArray.length ? (
        <div>
          <ol>
            {gamesArray.map((game) => {
              const currentData = getUserData(game, 'MAIN');
              const opponentData = getUserData(game, 'OPPONENT');
              const currentAccuracy = calcAccuracy(
                currentData?.shots,
                currentData?.kills
              );
              const opponentAccuracy = calcAccuracy(
                opponentData?.shots,
                opponentData?.kills
              );

              return (
                <li key={game?.id}>
                  <Gutter direction="bottom" size="xl">
                    <Gap vertical>
                      <div>
                        {t.multi.winner}: {retrieveWinnerName(game?.winnerId)}
                      </div>
                      <div>
                        {t.multi.gameLine(
                          currentUser?.firstName || '',
                          currentData.kills,
                          currentAccuracy,
                          currentData.score
                        )}
                      </div>
                      <div>
                        {t.multi.gameLine(
                          opponentUser?.firstName || '',
                          opponentData.kills,
                          opponentAccuracy,
                          opponentData.score
                        )}
                      </div>
                    </Gap>
                  </Gutter>
                </li>
              );
            })}
          </ol>
        </div>
      ) : (
        <Gutter size="xl" direction="vertical">
          <Text align="center" secondary>
            {t.multi.noGames}
          </Text>
        </Gutter>
      )}
    </Modal>
  );
}

// A game without a winner yet must not count for a missing (undefined) player
function isWinner(game: GameType, userId?: string) {
  return Boolean(userId && game.winnerId === userId);
}

function FinalRanking({
  currentUserName,
  currentUserWins,
  opponentWins,
  opponentName,
}: {
  currentUserName?: string;
  currentUserWins: number;
  opponentName?: string;
  opponentWins: number;
}) {
  return (
    <Gutter direction="top" size="xl">
      <Gap justify="center" align="center">
        <Gutter size="lg">
          <div className="text-right">
            <Title weight="medium" size="h1">
              {currentUserWins}
            </Title>
          </div>
          <div className="text-right">{currentUserName}</div>
        </Gutter>
        <div>X</div>
        <Gutter size="lg">
          <div>
            <Title weight="medium" size="h1">
              {opponentWins}
            </Title>
          </div>
          <div>{opponentName}</div>
        </Gutter>
      </Gap>
    </Gutter>
  );
}
