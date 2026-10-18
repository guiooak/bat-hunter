import { useEffect, useMemo, useRef } from 'react';
import {
  playBackgroundMusic,
  playChallengeBackgroundMusic,
} from 'src/services/audio-service';
import { killAllBats } from 'src/services/game-service';
import { Button, ButtonGroup, GameClock, Gutter, Title } from '@components';
import { iterate } from 'src/services/iteration-service';
import { useCountdown } from 'src/hooks/game-hooks';
import { SINGLE_PLAYER_CHALLENGE_STATES } from './_single-player-constants';
import { DifficultyPicker } from 'src/features/difficulty-picker';
import { Difficulty } from 'src/services/bat-types';

const COUNTDOWN_TIME_TOTAL = 60;

export function SinglePlayerDashboardChallenge({
  currentGameStateFull = [SINGLE_PLAYER_CHALLENGE_STATES.FREE_PLAY, () => {}],
  onCreateBat = () => {},
  setIsScoreEnabled = () => {},
  onResetScore = () => {},
  difficulty,
  onDifficultyChange,
}: {
  currentGameStateFull: [string, (v: string) => void];
  difficulty: Difficulty;
  onDifficultyChange: (value: Difficulty) => void;
  onCreateBat: () => void;
  setIsScoreEnabled: (v: boolean) => void;
  onResetScore: () => void;
}) {
  const [currentGameState, setCurrentGameState] = currentGameStateFull;
  const { countdownTime, startCountdown, stopCountdown } = useCountdown(() =>
    setCurrentGameState(SINGLE_PLAYER_CHALLENGE_STATES.CHALLENGE_FINISHED)
  );

  const GAME_MODE = useMemo(
    () => ({
      [SINGLE_PLAYER_CHALLENGE_STATES.FREE_PLAY]: {
        label: 'Free Play!',
        onStart: () => {
          stopCountdown();
          onResetScore();
          setIsScoreEnabled(true);
        },
        onChallengeReady: () =>
          setCurrentGameState(SINGLE_PLAYER_CHALLENGE_STATES.CHALLENGE_READY),
      },
      [SINGLE_PLAYER_CHALLENGE_STATES.CHALLENGE_READY]: {
        label: 'Get Ready!',
        onStart: () => {
          stopCountdown();
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
          setIsScoreEnabled(true);
          playChallengeBackgroundMusic();
          startCountdown(COUNTDOWN_TIME_TOTAL);
        },
        onCancel: () =>
          setCurrentGameState(
            SINGLE_PLAYER_CHALLENGE_STATES.CHALLENGE_FINISHED
          ),
      },
      [SINGLE_PLAYER_CHALLENGE_STATES.CHALLENGE_FINISHED]: {
        label: "Time's Up!",
        onStart: () => {
          stopCountdown();
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
    [
      onResetScore,
      onCreateBat,
      setIsScoreEnabled,
      setCurrentGameState,
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
      <Title>Game Mode</Title>
      <Gutter className="text-center" size="xxl">
        <GameClock
          countdownTime={countdownTime}
          label={currentGameModel.label}
        />
      </Gutter>
      {/* Locked and out of the way while the challenge runs */}
      {currentGameState !==
        SINGLE_PLAYER_CHALLENGE_STATES.CHALLENGE_IN_PROGRESS && (
        <Gutter size="lg" direction="bottom">
          <DifficultyPicker value={difficulty} onChange={onDifficultyChange} />
        </Gutter>
      )}
      <ButtonGroup flex>
        {currentGameModel.onCancel && (
          <Button onClick={currentGameModel.onCancel}>Cancel</Button>
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
