import { useEffect, useMemo, useState } from 'react';
import {
  playBackgroundMusic,
  playChallengeBackgroundMusic,
} from 'src/services/audio-service';
import { killAllBats } from 'src/services/game-service';
import { Button, ButtonGroup, Gutter, Text, Title } from '@components';
import { iterate } from 'src/services/iteration-service';
import { SINGLE_PLAYER_CHALLENGE_STATES } from './_single-player-constants';

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

export function SinglePlayerDashboardChallenge({
  currentGameStateFull = [SINGLE_PLAYER_CHALLENGE_STATES.FREE_PLAY, () => {}],
  onCreateBat = () => {},
  setIsScoreEnabled = () => {},
  onResetScore = () => {},
}: {
  currentGameStateFull: [string, (v: string) => void];
  onCreateBat: () => void;
  setIsScoreEnabled: (v: boolean) => void;
  onResetScore: () => void;
}) {
  const COUNTDOWN_TIME_TOTAL = 60;

  const [currentGameState, setCurrentGameState] = currentGameStateFull;
  const [countdownTime, setCountdownTime] = useState(0);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout>();

  const GAME_MODE = useMemo(
    () => ({
      [SINGLE_PLAYER_CHALLENGE_STATES.FREE_PLAY]: {
        label: 'Free Play!',
        onStart: () => {
          onResetScore();
          setIsScoreEnabled(true);
        },
        onChallengeReady: () =>
          setCurrentGameState(SINGLE_PLAYER_CHALLENGE_STATES.CHALLENGE_READY),
      },
      [SINGLE_PLAYER_CHALLENGE_STATES.CHALLENGE_READY]: {
        label: 'Get Ready!',
        onStart: () => {
          onResetScore();
          killAllBats();
          setIsScoreEnabled(false);
        },
        onFreePlay: () =>
          setCurrentGameState(SINGLE_PLAYER_CHALLENGE_STATES.FREE_PLAY),
        onChallengeStart: () =>
          setCurrentGameState(
            SINGLE_PLAYER_CHALLENGE_STATES.CHALLENGE_IN_PROGRESS
          ),
      },
      [SINGLE_PLAYER_CHALLENGE_STATES.CHALLENGE_IN_PROGRESS]: {
        onStart: () => {
          iterate(30, onCreateBat);
          setCountdownTime(COUNTDOWN_TIME_TOTAL);
          setIsScoreEnabled(true);
          playChallengeBackgroundMusic();

          let counter = COUNTDOWN_TIME_TOTAL - 1;

          const id = setInterval(() => {
            if (counter <= 0) {
              setCurrentGameState(
                SINGLE_PLAYER_CHALLENGE_STATES.CHALLENGE_FINISHED
              );
              clearInterval(id);
            }

            setCountdownTime(counter);
            counter -= 1;
          }, 1000);

          setIntervalId(id);
        },
        onCancel: () =>
          setCurrentGameState(
            SINGLE_PLAYER_CHALLENGE_STATES.CHALLENGE_FINISHED
          ),
      },
      [SINGLE_PLAYER_CHALLENGE_STATES.CHALLENGE_FINISHED]: {
        label: "Time's Up!",
        onStart: () => {
          killAllBats();
          playBackgroundMusic();
          setIsScoreEnabled(false);
        },
        onFreePlay: () =>
          setCurrentGameState(SINGLE_PLAYER_CHALLENGE_STATES.FREE_PLAY),
        onChallengeReady: () =>
          setCurrentGameState(SINGLE_PLAYER_CHALLENGE_STATES.CHALLENGE_READY),
      },
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    GAME_MODE[currentGameState].onStart();
  }, [currentGameState, GAME_MODE]);

  const currentGameModel = GAME_MODE[currentGameState];

  return (
    <section>
      <Title>Game Mode</Title>
      <Gutter className="text-center" size="xxl">
        <Text size="xl">
          {handleGameLabel(countdownTime, currentGameModel.label || '')}
        </Text>
      </Gutter>
      <ButtonGroup flex>
        {currentGameModel.onCancel && (
          <Button
            onClick={() => {
              currentGameModel.onCancel?.();
              clearInterval(intervalId);
              setCountdownTime(0);
            }}
          >
            Cancel
          </Button>
        )}
        {currentGameModel.onFreePlay && (
          <Button onClick={currentGameModel.onFreePlay}>Free Play</Button>
        )}
        {currentGameModel.onChallengeReady && (
          <Button onClick={currentGameModel.onChallengeReady}>Challenge</Button>
        )}
        {currentGameModel.onChallengeStart && (
          <Button kind="primary" onClick={currentGameModel.onChallengeStart}>
            Start
          </Button>
        )}
      </ButtonGroup>
    </section>
  );
}

/*
- FREE_PLAY (default)
-- Display: FREE PLAY
-- Display Button: Challenge Mode
-- Reset score

- CHALLENGE_READY
-- Display: Get Ready!
-- Display Button: Free Play | Start
-- Reset score
-- Kill All Bats
-- Block shot and kill metrics.
-- Block "Send Bat" button.

- CHALLENGE_IN_PROGRESS
-- Display: [Countdown]
-- Block "Reset", "Close", "Clean Bats", "Reset" buttons.
-- change music - find something more intense

- CHALLENGE_FINISHED
-- Display: Time's up!
-- Display Button: Free Play | Start
-- Kill All Bats
-- Return to regular music
-- Block shot and kill metrics.
-- Block "Send Bat" button.
*/
