import { useMemo } from 'react';
import { Gutter, Modal, Text, Title } from 'src/components';
import { Gap } from 'src/components/gap';
import { useAuthContext } from 'src/features/authentication';
import { MatchType } from 'src/models/match-model';
import { GameType } from 'src/models/game-model';
import {
  buildGameSortedArray,
  calcAccuracy,
  calcFinalScore,
} from 'src/services/game-service';
import { useMultiPlayerContext } from 'src/features/multi-player/multi-player-context';

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
  const { opponentUser } = useMultiPlayerContext();
  const isCurrentUserTheHost = currentUser?.id === match?.hostId;

  function retrieveWinnerName(winnerId?: string) {
    if (winnerId === 'DRAW') return 'Same Score! 🤝';
    if (winnerId === currentUser?.id) return `${currentUser?.firstName} 🎉`;
    if (winnerId === opponentUser?.id) return `${opponentUser?.firstName} 🎉`;
    return 'N/A';
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
      score: calcFinalScore(data?.shotCounter, data?.killCounter) || 0,
    };
  }

  const gamesArray = buildGameSortedArray(match?.games, 'ASC');

  const { currentWins, opponentWins } = useMemo(() => {
    const init = { currentWins: 0, opponentWins: 0 };

    return (
      gamesArray?.reduce((acc, game) => {
        const currentIncrease = game?.winnerId === currentUser?.id ? 1 : 0;
        const opponentIncrease = game?.winnerId === opponentUser?.id ? 1 : 0;

        return {
          currentWins: acc.currentWins + currentIncrease,
          opponentWins: acc.opponentWins + opponentIncrease,
        };
      }, init) || init
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gamesArray]);

  return (
    <Modal open={open} onClose={onClose} header="Games History">
      {gamesArray ? (
        <div>
          <FinalRanking
            opponentWins={opponentWins}
            currentUserWins={currentWins}
            opponentName={opponentUser?.firstName}
            currentUserName={currentUser?.firstName}
          />
          <ol>
            {gamesArray.map((game) => {
              if (
                !['GAME_FINISHED', 'GAME_CLOSED'].includes(game.state || '')
              ) {
                return (
                  <li key={game?.id}>
                    This game is still pending. Go play it!
                  </li>
                );
              }

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
                      <div>Winner: {retrieveWinnerName(game?.winnerId)}</div>
                      <div>
                        {currentUser?.firstName}: {currentData.kills} kills |{' '}
                        {currentAccuracy}% accuracy | score: {currentData.score}
                      </div>
                      <div>
                        {opponentUser?.firstName}: {opponentData.kills} kills |{' '}
                        {opponentAccuracy}% accuracy | score:{' '}
                        {opponentData.score}
                      </div>
                    </Gap>
                  </Gutter>
                </li>
              );
            })}
          </ol>
        </div>
      ) : (
        <Text align="center">No games yet to show.</Text>
      )}
    </Modal>
  );
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
