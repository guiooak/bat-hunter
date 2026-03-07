import { useEffect, useMemo, useReducer, useState } from 'react';
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
import { calcFinalScore, findCurrentGame } from 'src/services/game-service';
import { useIsCurrentUserTheHost } from 'src/hooks/game-hooks';
import { MultiPlayerGameResultModal } from './_multi-player-game-result-modal';
import { MultiPlayerGameHistoryModal } from './_multi-player-game-history-modal';
import { useMultiPlayerContext } from 'src/features/multi-player/multi-player-context';

export function MultiPlayerGameDashboard() {
  const { match } = useMultiPlayerContext();
  const isCurrentUserTheHost = useIsCurrentUserTheHost(match);
  const [openResultModal, setOpenResultModal] = useState(false);
  const [openHhistoryModal, setOpenHhistoryModal] = useState(false);
  const [killCounter, dispatchKillCounter] = useReducer(counterReducer, 0);
  const [shotCounter, dispatchShotCounter] = useReducer(counterReducer, 0);

  const currentGame = useMemo(() => {
    if (!match) return;

    return findCurrentGame(match);
  }, [match]);

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

    if (!currentGame) {
      findOrCreateGame(match);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCurrentUserTheHost, currentGame]);

  // Save score data in database
  useEffect(() => {
    console.log('kills x shots: ', `${killCounter} x ${shotCounter}`);

    if (match?.id && currentGame?.id && isGameInProgress)
      setPlayerDataInFirebase({
        matchId: match.id,
        gameId: currentGame?.id,
        player: isCurrentUserTheHost ? 'host' : 'guest',
        data: {
          shotCounter,
          killCounter,
        },
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shotCounter, killCounter]);

  function cleanScore() {
    dispatchKillCounter('reset');
    dispatchShotCounter('reset');
  }

  useEffect(() => {
    if (currentGame?.winnerId && !isGameClosed(currentGame)) {
      setOpenResultModal(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentGame?.winnerId, currentGame?.state]);

  const onStateChange = (state: GameStateType) => {
    if (isCurrentUserTheHost && !currentGame?.winnerId) {
      setGameState(match?.id, currentGame?.id, state);
    }

    if (state === 'GAME_READY') {
      if (isCurrentUserTheHost) {
        finishGameWithWinner(currentGame, match?.id);
      }
    }

    if (state === 'GAME_FINISHED') {
      if (isCurrentUserTheHost) {
        const winnerId = getWinnerId(match);
        setGameWinner(match?.id, currentGame?.id, winnerId);
      }
    }
  };

  return (
    <>
      <div className="multi-player-game-dashboard">
        <Card className="multi-player-game-dashboard__card">
          <Gutter size="md">
            <MultiPlayerGameDashboardController
              onKill={() => dispatchKillCounter('add')}
              onShot={() => dispatchShotCounter('add')}
              onOpenHistory={() => setOpenHhistoryModal(true)}
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
        open={openHhistoryModal}
        onClose={() => setOpenHhistoryModal(false)}
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
    matchId: matchId,
    data: { id: game?.id, state: 'GAME_CLOSED' },
  });
}

function getWinnerId(match?: MatchType) {
  const currentGame = findCurrentGame(match);
  const hostFinalScore = calcFinalScore(
    currentGame?.hostData?.shotCounter,
    currentGame?.hostData?.killCounter
  );

  const guestFinalScore = calcFinalScore(
    currentGame?.guestData?.shotCounter,
    currentGame?.guestData?.killCounter
  );

  return guestFinalScore === hostFinalScore
    ? 'DRAW'
    : guestFinalScore > hostFinalScore
      ? match?.guestId
      : match?.hostId;
}

function findOrCreateGame(match?: MatchType) {
  if (findCurrentGame(match)) {
    return;
  }

  if (match?.id) {
    createGameInFirebase({
      matchId: match?.id,
      onError: () => {
        console.error('ERROR: could not register new game in Firebase.');
      },
    });
    return;
  }

  console.error('ERROR: Could not retrieve a game.');
}

function counterReducer(state: number, action: 'add' | 'reset') {
  return action === 'add' ? state + 1 : 0;
}
