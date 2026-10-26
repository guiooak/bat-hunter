import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuthContext } from 'src/features/authentication';
import { MatchType } from 'src/models/match-model';
import {
  findLastGame,
  getIsGameModeOn,
  setBodyOnClick,
} from 'src/services/game-service';
import { createBat } from 'src/services/fly-engine-service';
import { isShotEnabled, ShotEventType } from 'src/services/shot-service';
import { BatType, Difficulty, pickBatType } from 'src/services/bat-types';

export function useIsCurrentUserTheHost(match?: MatchType) {
  const { currentUser } = useAuthContext();

  return Boolean(match?.hostId && match.hostId === currentUser?.id);
}

export function useGameCounters({
  match,
  playerKind,
}: {
  match?: MatchType;
  playerKind: 'main' | 'opponent';
}) {
  const isCurrentUserTheHost = useIsCurrentUserTheHost(match);

  return useMemo(() => {
    const currentGame = findLastGame(match);
    const isHostData =
      (isCurrentUserTheHost && playerKind === 'main') ||
      (!isCurrentUserTheHost && playerKind === 'opponent');
    const playerData = isHostData
      ? currentGame?.hostData
      : currentGame?.guestData;

    const killCounter = playerData?.killCounter || 0;

    return {
      shotCounter: playerData?.shotCounter || 0,
      killCounter,
      // Games saved before the hard mode have no points: a kill was a point
      points: playerData?.points ?? killCounter,
    };
  }, [match, isCurrentUserTheHost, playerKind]);
}

// Keeps the latest value reachable from long-living callbacks (bats, DOM
// handlers) and from effects that must not rerun when a callback is recreated.
export function useLatestRef<T>(value: T) {
  const ref = useRef(value);

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref;
}

export function useGameCounterTriggers({
  onShot,
  onHit,
  difficulty,
}: {
  onShot: () => void;
  onHit: (type: BatType) => void;
  difficulty: Difficulty;
}) {
  const [isScoreEnabled, setIsScoreEnabled] = useState(true);
  const isScoreEnabledRef = useLatestRef(isScoreEnabled);
  const onShotRef = useLatestRef(onShot);
  const onHitRef = useLatestRef(onHit);
  const difficultyRef = useLatestRef(difficulty);

  const createControlledBat = useCallback(
    () =>
      createBat({
        type: pickBatType(difficultyRef.current),
        withPoints: difficultyRef.current === 'hard',
        onHit: (type) => {
          if (isScoreEnabledRef.current) onHitRef.current(type);
        },
      }),
    [isScoreEnabledRef, onHitRef, difficultyRef]
  );

  useEffect(() => {
    setBodyOnClick((e: ShotEventType) => {
      if (isScoreEnabledRef.current && getIsGameModeOn() && isShotEnabled(e)) {
        onShotRef.current();
      }
    });

    return () => setBodyOnClick(null);
  }, [isScoreEnabledRef, onShotRef]);

  return {
    createControlledBat,
    setIsScoreEnabled,
  };
}

// A game is a small state machine: each state has an onStart, run when the
// game enters that state (not when the modes object is rebuilt), plus its own
// actions and label. Returns the current state's mode.
export function useGameMode<
  State extends string,
  Mode extends { onStart: () => void },
>(modes: Record<State, Mode>, state: State) {
  const modesRef = useLatestRef(modes);

  useEffect(() => {
    modesRef.current[state].onStart();
  }, [state, modesRef]);

  return modes[state];
}

export function useCountdown(onFinish: () => void) {
  const [countdownTime, setCountdownTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const onFinishRef = useLatestRef(onFinish);

  const stopCountdown = useCallback(() => {
    clearInterval(intervalRef.current);
    setCountdownTime(0);
  }, []);

  const startCountdown = useCallback(
    (totalInSeconds: number) => {
      clearInterval(intervalRef.current);

      let counter = totalInSeconds;
      setCountdownTime(counter);

      intervalRef.current = setInterval(() => {
        counter -= 1;
        setCountdownTime(counter);

        if (counter <= 0) {
          clearInterval(intervalRef.current);
          onFinishRef.current();
        }
      }, 1000);
    },
    [onFinishRef]
  );

  useEffect(() => () => clearInterval(intervalRef.current), []);

  return { countdownTime, startCountdown, stopCountdown };
}

const SPAWN_POPULATION = 30;
const SPAWN_REFILL_PER_TICK = 3;
const SPAWN_TICK_MS = 1000;

// While a game runs the sky fills itself: a full flock at the start, then a
// few bats a second whenever hits (or golden bats flying away) thin it out.
export function useBatSpawner(createBat: () => void, active: boolean) {
  const createBatRef = useLatestRef(createBat);

  useEffect(() => {
    if (!active) return;

    const missing = () =>
      SPAWN_POPULATION - document.querySelectorAll('.flying-bat').length;

    const initial = missing();
    for (let i = 0; i < initial; i++) createBatRef.current();

    const interval = setInterval(() => {
      const count = Math.min(missing(), SPAWN_REFILL_PER_TICK);
      for (let i = 0; i < count; i++) createBatRef.current();
    }, SPAWN_TICK_MS);

    return () => clearInterval(interval);
  }, [active, createBatRef]);
}
