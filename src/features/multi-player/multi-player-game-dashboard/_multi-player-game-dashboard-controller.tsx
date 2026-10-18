import { useEffect, useMemo, useRef, useState } from 'react';
import {
  playBackgroundMusic,
  playChallengeBackgroundMusic,
} from 'src/services/audio-service';
import { killAllBats } from 'src/services/game-service';
import { Button, ButtonGroup, GameClock, Gutter } from '@components';
import {
  useBatSpawner,
  useCountdown,
  useGameCounterTriggers,
} from 'src/hooks/game-hooks';
import { GAME_STATES, GameStateType } from 'src/models/game-model';
import { BatType, Difficulty } from 'src/services/bat-types';
import { DifficultyPicker } from 'src/features/difficulty-picker';

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
  onResetScore = () => {},
  onShot = () => {},
  onHit = () => {},
  onStateChange = () => {},
  onOpenHistory = () => {},
  onDifficultyChange = () => {},
  difficulty,
  isCurrentUserTheHost,
  remoteGameState,
}: {
  onResetScore: () => void;
  onShot: () => void;
  onHit: (type: BatType) => void;
  onDifficultyChange: (value: Difficulty) => void;
  difficulty: Difficulty;
  onOpenHistory: () => void;
  onStateChange: (state: GameStateType) => void;
  isCurrentUserTheHost?: boolean;
  remoteGameState?: GameStateType;
}) {
  const [currentGameState, setCurrentGameState] = useState<GameStateType>(
    GAME_STATES.GAME_READY
  );
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

  useEffect(() => {
    if (!isCurrentUserTheHost && remoteGameState) {
      setCurrentGameState(remoteGameState);
    }
  }, [isCurrentUserTheHost, remoteGameState]);

  useEffect(() => {
    onStateChange(currentGameState);
  }, [currentGameState, onStateChange]);

  const GAME_MODE: Record<GameStateType, GameModeConfigType> = useMemo(
    () => ({
      [GAME_STATES.GAME_READY]: {
        label: 'Get Ready!',
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
        label: "Time's Up!",
        onStart: () => {
          stopCountdown();
          killAllBats();
          playBackgroundMusic();
          setIsScoreEnabled(false);
        },
        onChallengeReady: () => setCurrentGameState(GAME_STATES.GAME_READY),
        onChallengeReadyLabel: 'Play again',
        onOpenHistory,
        onCancel: undefined,
      },
      [GAME_STATES.GAME_CLOSED]: {
        label: 'Game Closed',
        onStart: () => {
          stopCountdown();
          killAllBats();
          setIsScoreEnabled(false);
        },
      },
    }),
    [
      onResetScore,
      onOpenHistory,
      setIsScoreEnabled,
      startCountdown,
      stopCountdown,
    ]
  );

  // Only a state change starts a mode, not a new GAME_MODE reference
  const gameModeRef = useRef(GAME_MODE);
  gameModeRef.current = GAME_MODE;

  useEffect(() => {
    gameModeRef.current[currentGameState].onStart();
  }, [currentGameState]);

  const currentGameModel = GAME_MODE[currentGameState];

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
                ? 'Host picks'
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
            Cancel
          </Button>
        )}
        {currentGameModel.onOpenHistory && (
          <Button kind="secondary" onClick={currentGameModel.onOpenHistory}>
            History
          </Button>
        )}
        {currentGameModel.onChallengeReady && isCurrentUserTheHost && (
          <Button onClick={currentGameModel.onChallengeReady} kind="primary">
            {currentGameModel.onChallengeReadyLabel || 'Play'}
          </Button>
        )}
        {currentGameModel.onMatchStart && isCurrentUserTheHost && (
          <Button kind="primary" onClick={currentGameModel.onMatchStart}>
            Start
          </Button>
        )}
      </ButtonGroup>
    </section>
  );
}
