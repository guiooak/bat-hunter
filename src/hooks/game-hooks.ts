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

// Keeps the latest value reachable from long-living callbacks (bats, DOM handlers).
function useLatestRef<T>(value: T) {
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
