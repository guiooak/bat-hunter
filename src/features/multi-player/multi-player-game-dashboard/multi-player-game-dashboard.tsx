import { useEffect, useMemo, useReducer, useRef, useState } from 'react';
import './multi-player-game-dashboard.scss';
import { MultiPlayerGameDashboardController } from './_multi-player-game-dashboard-controller';
import { Card, Gutter } from '@components';
import { MatchType } from 'src/models/match-model';
import {
  createGameInFirebase,
  GameStateType,
  GameType,
  setGameInFirebase,
  setGameState,
  setGameWinner,
  setPlayerDataInFirebase,
} from 'src/models/game-model';
import {
  calcFinalScore,
  counterReducer,
  findCurrentGame,
  findLastGame,
  pointsReducer,
  scoreHit,
} from 'src/services/game-service';
import { Difficulty } from 'src/services/bat-types';
import { useIsCurrentUserTheHost } from 'src/hooks/game-hooks';
import { MultiPlayerGameResultModal } from './_multi-player-game-result-modal';
import { MultiPlayerGameHistoryModal } from './_multi-player-game-history-modal';
import { useMultiPlayerContext } from 'src/features/multi-player/multi-player-context';

export function MultiPlayerGameDashboard() {
  const { match } = useMultiPlayerContext();
  const isCurrentUserTheHost = useIsCurrentUserTheHost(match);
  const [openResultModal, setOpenResultModal] = useState(false);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const isCreatingGameRef = useRef(false);
  const [killCounter, dispatchKillCounter] = useReducer(counterReducer, 0);
  const [shotCounter, dispatchShotCounter] = useReducer(counterReducer, 0);
  const [points, dispatchPoints] = useReducer(pointsReducer, 0);

  const currentGame = useMemo(() => {
    if (!match) return;

    return findCurrentGame(match);
  }, [match]);

  const difficulty: Difficulty = currentGame?.difficulty ?? 'easy';

  const isGameInProgress = useMemo(
    () => currentGame?.state === 'GAME_IN_PROGRESS',
    [currentGame?.state]
  );

  // Finish game with winner when the page loads
  useEffect(() => {
    if (!isCurrentUserTheHost) return;

    if (currentGame?.winnerId && !isGameClosed(currentGame)) {
      finishGameWithWinner(currentGame, match?.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCurrentUserTheHost]);

  // Create a new game once there is no unfinished game
  useEffect(() => {
    if (!isCurrentUserTheHost) return;

    if (match?.id && !currentGame && !isCreatingGameRef.current) {
      isCreatingGameRef.current = true;
      // A new round keeps the difficulty of the last one
      createGameInFirebase(match.id, findLastGame(match)?.difficulty)
        .catch((e) =>
          console.error('ERROR: could not register new game in Firebase.', e)
        )
        .finally(() => {
          isCreatingGameRef.current = false;
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCurrentUserTheHost, currentGame]);

  // Save score data in database
  useEffect(() => {
    if (match?.id && currentGame?.id && isGameInProgress)
      setPlayerDataInFirebase({
        matchId: match.id,
        gameId: currentGame.id,
        player: isCurrentUserTheHost ? 'host' : 'guest',
        data: {
          shotCounter,
          killCounter,
          points,
        },
      }).catch(logFirebaseError);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shotCounter, killCounter, points]);

  function cleanScore() {
    dispatchKillCounter('reset');
    dispatchShotCounter('reset');
    dispatchPoints('reset');
  }

  function changeDifficulty(value: Difficulty) {
    if (!isCurrentUserTheHost || !match?.id || !currentGame?.id) return;

    setGameInFirebase({
      matchId: match.id,
      data: { id: currentGame.id, difficulty: value },
    }).catch(logFirebaseError);
  }

  useEffect(() => {
    if (currentGame?.winnerId && !isGameClosed(currentGame)) {
      setOpenResultModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGame?.winnerId, currentGame?.state]);

  const onStateChange = (state: GameStateType) => {
    if (isCurrentUserTheHost && !currentGame?.winnerId) {
      setGameState(match?.id, currentGame?.id, state)?.catch(logFirebaseError);
    }

    if (state === 'GAME_READY') {
      if (isCurrentUserTheHost) {
        finishGameWithWinner(currentGame, match?.id);
      }
    }

    if (state === 'GAME_FINISHED') {
      if (isCurrentUserTheHost) {
        const winnerId = getWinnerId(match);
        setGameWinner(match?.id, currentGame?.id, winnerId)?.catch(
          logFirebaseError
        );
      }
    }
  };

  return (
    <>
      <div className="multi-player-game-dashboard">
        <Card className="multi-player-game-dashboard__card">
          <Gutter size="md">
            <MultiPlayerGameDashboardController
              onHit={(type) =>
                scoreHit(type, {
                  addKill: () => dispatchKillCounter('add'),
                  addPoints: dispatchPoints,
                })
              }
              difficulty={difficulty}
              onDifficultyChange={changeDifficulty}
              onShot={() => dispatchShotCounter('add')}
              onOpenHistory={() => setOpenHistoryModal(true)}
              onStateChange={onStateChange}
              onResetScore={cleanScore}
              isCurrentUserTheHost={isCurrentUserTheHost}
              remoteGameState={currentGame?.state}
            />
          </Gutter>
        </Card>
      </div>
      <MultiPlayerGameResultModal
        open={openResultModal}
        onClose={() => setOpenResultModal(false)}
        match={match}
        game={currentGame}
      />
      <MultiPlayerGameHistoryModal
        match={match}
        open={openHistoryModal}
        onClose={() => setOpenHistoryModal(false)}
      />
    </>
  );
}

function isGameClosed(game?: GameType) {
  return game?.state === 'GAME_CLOSED';
}

function finishGameWithWinner(game?: GameType, matchId?: string) {
  if (!matchId || !game?.id) return;

  if (!game?.winnerId || isGameClosed(game)) return;

  setGameInFirebase({
    matchId,
    data: { id: game.id, state: 'GAME_CLOSED' },
  }).catch(logFirebaseError);
}

function getWinnerId(match?: MatchType) {
  const currentGame = findCurrentGame(match);
  const hostFinalScore = calcFinalScore(
    currentGame?.hostData?.shotCounter,
    currentGame?.hostData?.killCounter,
    currentGame?.hostData?.points
  );

  const guestFinalScore = calcFinalScore(
    currentGame?.guestData?.shotCounter,
    currentGame?.guestData?.killCounter,
    currentGame?.guestData?.points
  );

  return guestFinalScore === hostFinalScore
    ? 'DRAW'
    : guestFinalScore > hostFinalScore
      ? match?.guestId
      : match?.hostId;
}

function logFirebaseError(e: unknown) {
  console.error('MultiPlayerGameDashboard::ERROR: Firebase write failed', e);
}
