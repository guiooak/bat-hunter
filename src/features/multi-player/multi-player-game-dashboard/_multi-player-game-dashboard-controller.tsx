import { useEffect, useMemo, useState } from 'react';
import {
  playBackgroundMusic,
  playChallengeBackgroundMusic,
} from 'src/services/audio-service';
import { killAllBats } from 'src/services/game-service';
import { Button, ButtonGroup, Gutter, Text } from '@components';
import { iterate } from 'src/services/iteration-service';
import { useGameCounterTriggers } from 'src/hooks/game-hooks';
import { GameStateType } from 'src/models/game-model';

export const GAME_STATES = {
  GAME_READY: 'GAME_READY',
  GAME_IN_PROGRESS: 'GAME_IN_PROGRESS',
  GAME_FINISHED: 'GAME_FINISHED',
  GAME_CLOSED: 'GAME_CLOSED',
} as const;

type GameModeConfigType = {
  label?: string;
  onStart: () => void;
  onMatchStart?: () => void;
  onOpenHistory?: () => void;
  onCancel?: () => void;
  onAddBats?: () => void;
  onChallengeReady?: () => void;
  onChallengeReadyLabel?: string;
};

let intervalId: NodeJS.Timeout;

export function MultiPlayerGameDashboardController({
  onResetScore = () => {},
  onShot = () => {},
  onKill = () => {},
  onStateChange = () => {},
  onOpenHistory = () => {},
  isCurrentUserTheHost,
  remoteGameState,
}: {
  onResetScore: () => void;
  onShot: () => void;
  onKill: () => void;
  onOpenHistory: () => void;
  onStateChange: (state: GameStateType) => void;
  isCurrentUserTheHost?: boolean;
  remoteGameState?: GameStateType;
}) {
  const COUNTDOWN_TIME_TOTAL = 60;
  const [currentGameState, setCurrentGameState] = useState<GameStateType>(
    GAME_STATES.GAME_READY
  );
  const [countdownTime, setCountdownTime] = useState(0);

  const { createControlledBat, setIsScoreEnabled } = useGameCounterTriggers({
    onShot,
    onKill,
  });

  useEffect(() => {
    if (!isCurrentUserTheHost && remoteGameState) {
      setCurrentGameState(remoteGameState);
    }
  }, [isCurrentUserTheHost, remoteGameState]);

  useEffect(() => {
    onStateChange(currentGameState);
  }, [currentGameState]);

  const GAME_MODE: Record<GameStateType, GameModeConfigType> = useMemo(
    () => ({
      [GAME_STATES.GAME_READY]: {
        label: 'Get Ready!',
        onStart: () => {
          onResetScore();
          killAllBats();
          setIsScoreEnabled(false);
          clearInterval(intervalId);
          setCountdownTime(0);
        },
        onMatchStart: () => setCurrentGameState(GAME_STATES.GAME_IN_PROGRESS),
        onOpenHistory,
        onCancel: undefined,
      },
      [GAME_STATES.GAME_IN_PROGRESS]: {
        onStart: () => {
          iterate(30, createControlledBat);
          setCountdownTime(COUNTDOWN_TIME_TOTAL);
          setIsScoreEnabled(true);
          playChallengeBackgroundMusic();

          let counter = COUNTDOWN_TIME_TOTAL - 1;

          const id = setInterval(() => {
            if (counter <= 0) {
              setCurrentGameState(GAME_STATES.GAME_FINISHED);
              clearInterval(id);
            }

            setCountdownTime(counter);
            counter -= 1;
          }, 1000);

          intervalId = id;
        },
        onAddBats: createControlledBat,
        onCancel: () => setCurrentGameState(GAME_STATES.GAME_READY),
      },
      [GAME_STATES.GAME_FINISHED]: {
        label: "Time's Up!",
        onStart: () => {
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
          killAllBats();
          setIsScoreEnabled(false);
        },
      },
    }),
    []
  );

  useEffect(() => {
    GAME_MODE[currentGameState].onStart();
  }, [currentGameState, GAME_MODE]);

  const currentGameModel = GAME_MODE[currentGameState];

  return (
    <section>
      <Gutter className="text-center" size="lg" direction="bottom">
        <Text size="xl">
          {handleGameLabel(countdownTime, currentGameModel.label || '')}
        </Text>
      </Gutter>
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
        {currentGameModel.onAddBats && (
          <Button kind="primary" onClick={currentGameModel.onAddBats}>
            Add bats
          </Button>
        )}
      </ButtonGroup>
    </section>
  );
}

function handleGameLabel(countdownTime: number, label: string) {
  const seconds = `${countdownTime}s`;

  if (countdownTime <= 0) {
    return label;
  }

  if (countdownTime <= 10) {
    return <span style={{ color: '#f05b7b' }}>{seconds}</span>;
  }

  return seconds;
}
