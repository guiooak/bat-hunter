import { useEffect, useReducer, useRef, useState } from 'react';
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
import { useDockHeight } from 'src/hooks/layout-hooks';
import { MultiPlayerGameResultModal } from './_multi-player-game-result-modal';
import { MultiPlayerGameHistoryModal } from './_multi-player-game-history-modal';
import { useMultiPlayerContext } from 'src/features/multi-player/multi-player-context';

export function MultiPlayerGameDashboard() {
  const { match } = useMultiPlayerContext();
  const isCurrentUserTheHost = useIsCurrentUserTheHost(match);
  const [openHistoryModal, setOpenHistoryModal] = useState(false);
  const [dismissedResultOf, setDismissedResultOf] = useState<string>();
  const dockRef = useRef<HTMLDivElement>(null);
  useDockHeight(dockRef);
  const [killCounter, dispatchKillCounter] = useReducer(counterReducer, 0);
  const [shotCounter, dispatchShotCounter] = useReducer(counterReducer, 0);
  const [points, dispatchPoints] = useReducer(pointsReducer, 0);

  const currentGame = findCurrentGame(match);
  const difficulty: Difficulty = currentGame?.difficulty ?? 'easy';
  const isGameInProgress = currentGame?.state === 'GAME_IN_PROGRESS';

  useHostGameLifecycle(match, currentGame, isCurrentUserTheHost);
  usePlayerScoreSync({
    matchId: match?.id,
    gameId: isGameInProgress ? currentGame?.id : undefined,
    player: isCurrentUserTheHost ? 'host' : 'guest',
    score: { shotCounter, killCounter, points },
  });

  // The result shows once a winner is set, until the player closes it
  const openResultModal = Boolean(
    currentGame?.winnerId &&
      !isGameClosed(currentGame) &&
      dismissedResultOf !== currentGame.id
  );

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
        <div ref={dockRef} className="multi-player-game-dashboard__dock">
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
                hasOpponent={Boolean(match?.guestId)}
                remoteGameState={currentGame?.state}
              />
            </Gutter>
          </Card>
        </div>
      </div>
      <MultiPlayerGameResultModal
        open={openResultModal}
        onClose={() => setDismissedResultOf(currentGame?.id)}
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

// The host owns the game lifecycle in Firebase: it closes a decided game left
// open (the page was reloaded after the result) and creates the next game
// whenever none is open.
function useHostGameLifecycle(
  match: MatchType | undefined,
  currentGame: GameType | undefined,
  isHost: boolean
) {
  const hasClosedLeftoverRef = useRef(false);
  const isCreatingGameRef = useRef(false);

  useEffect(() => {
    if (!isHost || !match || hasClosedLeftoverRef.current) return;

    hasClosedLeftoverRef.current = true;
    finishGameWithWinner(currentGame, match.id);
  }, [isHost, match, currentGame]);

  useEffect(() => {
    if (!isHost || !match?.id || currentGame || isCreatingGameRef.current) {
      return;
    }

    isCreatingGameRef.current = true;
    // A new round keeps the difficulty of the last one
    createGameInFirebase(match.id, findLastGame(match)?.difficulty)
      .catch((e) =>
        console.error('ERROR: could not register new game in Firebase.', e)
      )
      .finally(() => {
        isCreatingGameRef.current = false;
      });
  }, [isHost, match, currentGame]);
}

// Saves the player's score while a game runs, once per change.
function usePlayerScoreSync({
  matchId,
  gameId,
  player,
  score,
}: {
  matchId?: string;
  gameId?: string;
  player: 'host' | 'guest';
  score: { shotCounter: number; killCounter: number; points: number };
}) {
  const { shotCounter, killCounter, points } = score;

  // Primitive dependencies: Firebase echoes (new match objects) do not rerun it
  useEffect(() => {
    if (!matchId || !gameId) return;

    setPlayerDataInFirebase({
      matchId,
      gameId,
      player,
      data: { shotCounter, killCounter, points },
    }).catch(logFirebaseError);
  }, [matchId, gameId, player, shotCounter, killCounter, points]);
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
