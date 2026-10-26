import { useEffect, useState } from 'react';
import {
  playBackgroundMusic,
  playChallengeBackgroundMusic,
} from 'src/services/audio-service';
import { killAllBats } from 'src/services/game-service';
import { Button, ButtonGroup, GameClock, Gutter, Text } from 'src/components';
import {
  useBatSpawner,
  useCountdown,
  useGameCounterTriggers,
  useGameMode,
  useLatestRef,
} from 'src/hooks/game-hooks';
import { GAME_STATES, GameStateType } from 'src/models/game-model';
import { BatType, Difficulty } from 'src/services/bat-types';
import { DifficultyPicker } from 'src/features/difficulty-picker';
import { useI18n } from 'src/i18n';

const COUNTDOWN_TIME_TOTAL = 60;

type GameModeConfigType = {
  label?: string;
  onStart: () => void;
  onMatchStart?: () => void;
  onOpenHistory?: () => void;
  onCancel?: () => void;
  onChallengeReady?: () => void;
  onChallengeReadyLabel?: string;
};

export function MultiPlayerGameDashboardController({
  onResetScore,
  onShot,
  onHit,
  onStateChange,
  onOpenHistory,
  onDifficultyChange,
  difficulty,
  hasOpponent = false,
  isCurrentUserTheHost,
  remoteGameState,
}: {
  onResetScore: () => void;
  onShot: () => void;
  onHit: (type: BatType) => void;
  onDifficultyChange: (value: Difficulty) => void;
  difficulty: Difficulty;
  // Until someone accepts the invitation there is no game to start and no
  // history to show
  hasOpponent?: boolean;
  onOpenHistory: () => void;
  onStateChange: (state: GameStateType) => void;
  isCurrentUserTheHost?: boolean;
  remoteGameState?: GameStateType;
}) {
  const { t } = useI18n();
  const [localGameState, setCurrentGameState] = useState<GameStateType>(
    GAME_STATES.GAME_READY
  );
  // The host drives the game; the guest follows the state from Firebase
  const currentGameState =
    !isCurrentUserTheHost && remoteGameState ? remoteGameState : localGameState;
  const { countdownTime, startCountdown, stopCountdown } = useCountdown(() =>
    setCurrentGameState(GAME_STATES.GAME_FINISHED)
  );

  const { createControlledBat, setIsScoreEnabled } = useGameCounterTriggers({
    onShot,
    onHit,
    difficulty,
  });

  useBatSpawner(
    createControlledBat,
    currentGameState === GAME_STATES.GAME_IN_PROGRESS
  );

  // Only on state changes: the parent recreates onStateChange on every render,
  // and it writes to Firebase, whose echo renders again
  const onStateChangeRef = useLatestRef(onStateChange);

  useEffect(() => {
    onStateChangeRef.current(currentGameState);
  }, [currentGameState, onStateChangeRef]);

  const GAME_MODE: Record<GameStateType, GameModeConfigType> = {
    [GAME_STATES.GAME_READY]: {
      label: t.game.getReady,
      onStart: () => {
        onResetScore();
        killAllBats();
        setIsScoreEnabled(false);
        stopCountdown();
      },
      onMatchStart: () => setCurrentGameState(GAME_STATES.GAME_IN_PROGRESS),
      onOpenHistory,
      onCancel: undefined,
    },
    [GAME_STATES.GAME_IN_PROGRESS]: {
      onStart: () => {
        setIsScoreEnabled(true);
        playChallengeBackgroundMusic();
        startCountdown(COUNTDOWN_TIME_TOTAL);
      },
      onCancel: () => setCurrentGameState(GAME_STATES.GAME_READY),
    },
    [GAME_STATES.GAME_FINISHED]: {
      label: t.game.timesUp,
      onStart: () => {
        stopCountdown();
        killAllBats();
        playBackgroundMusic();
        setIsScoreEnabled(false);
      },
      onChallengeReady: () => setCurrentGameState(GAME_STATES.GAME_READY),
      onChallengeReadyLabel: t.multi.playAgain,
      onOpenHistory,
      onCancel: undefined,
    },
    [GAME_STATES.GAME_CLOSED]: {
      label: t.multi.gameClosed,
      onStart: () => {
        stopCountdown();
        killAllBats();
        setIsScoreEnabled(false);
      },
    },
  };

  // Each state runs its onStart when the game enters it
  const currentGameModel = useGameMode(GAME_MODE, currentGameState);

  return (
    <section>
      <Gutter className="text-center" size="lg" direction="bottom">
        <GameClock
          countdownTime={countdownTime}
          label={currentGameModel.label}
        />
      </Gutter>
      {/* The host picks before the game starts, the guest just sees it.
          Hidden while playing, the bats need the room. */}
      {currentGameState !== GAME_STATES.GAME_IN_PROGRESS && (
        <Gutter size="md" direction="bottom">
          <DifficultyPicker
            value={difficulty}
            onChange={onDifficultyChange}
            readOnly={
              !isCurrentUserTheHost ||
              currentGameState !== GAME_STATES.GAME_READY
            }
            note={
              !isCurrentUserTheHost &&
              currentGameState === GAME_STATES.GAME_READY
                ? t.difficulty.hostPicks
                : undefined
            }
          />
        </Gutter>
      )}
      <ButtonGroup flex>
        {currentGameModel.onCancel && isCurrentUserTheHost && (
          <Button
            onClick={() => {
              currentGameModel.onCancel?.();
            }}
          >
            {t.game.cancel}
          </Button>
        )}
        {currentGameModel.onOpenHistory && (
          <Button
            kind="secondary"
            disabled={!hasOpponent}
            onClick={currentGameModel.onOpenHistory}
          >
            {t.multi.history}
          </Button>
        )}
        {currentGameModel.onChallengeReady && isCurrentUserTheHost && (
          <Button onClick={currentGameModel.onChallengeReady} kind="primary">
            {currentGameModel.onChallengeReadyLabel}
          </Button>
        )}
        {currentGameModel.onMatchStart && isCurrentUserTheHost && (
          <Button
            kind="primary"
            disabled={!hasOpponent}
            onClick={currentGameModel.onMatchStart}
          >
            {t.game.start}
          </Button>
        )}
      </ButtonGroup>
      {/* A match needs two players */}
      {currentGameModel.onMatchStart &&
        isCurrentUserTheHost &&
        !hasOpponent && (
          <Gutter size="sm" direction="top">
            <Text block secondary size="sm" align="center">
              {t.multi.waitingOpponent}
            </Text>
          </Gutter>
        )}
    </section>
  );
}
