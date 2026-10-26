import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act } from '@testing-library/react';
import { ME, renderHookWithContext } from 'src/test/render';
import type { MatchType } from 'src/models/match-model';
import * as gameService from 'src/services/game-service';
import * as shotService from 'src/services/shot-service';

const createBat = vi.hoisted(() => vi.fn());
vi.mock('src/services/fly-engine-service', () => ({ createBat }));

import {
  useBatSpawner,
  useCountdown,
  useGameCounters,
  useGameCounterTriggers,
  useGameMode,
  useIsCurrentUserTheHost,
} from './game-hooks';

beforeEach(() => createBat.mockClear());

const match: MatchType = {
  id: 'm1',
  hostId: ME.id,
  guestId: 'bia',
  games: {
    g1: {
      id: 'g1',
      createdAt: 1,
      hostData: { shotCounter: 4, killCounter: 3, points: 9 },
      guestData: { shotCounter: 2, killCounter: 1 },
    },
  },
};

describe('useIsCurrentUserTheHost', () => {
  it('is true only for the host of the match', () => {
    expect(
      renderHookWithContext(() => useIsCurrentUserTheHost(match)).result.current
    ).toBe(true);
    expect(
      renderHookWithContext(() =>
        useIsCurrentUserTheHost({ ...match, hostId: 'bia' })
      ).result.current
    ).toBe(false);
    expect(
      renderHookWithContext(() => useIsCurrentUserTheHost()).result.current
    ).toBe(false);
  });
});

describe('useGameCounters', () => {
  it('reads my counters as host and the opponent ones', () => {
    const main = renderHookWithContext(() =>
      useGameCounters({ match, playerKind: 'main' })
    ).result.current;
    const opponent = renderHookWithContext(() =>
      useGameCounters({ match, playerKind: 'opponent' })
    ).result.current;

    expect(main).toEqual({ shotCounter: 4, killCounter: 3, points: 9 });
    // No points saved: a kill was a point
    expect(opponent).toEqual({ shotCounter: 2, killCounter: 1, points: 1 });
  });

  it('as guest, mine are the guest data', () => {
    const guestMatch = { ...match, hostId: 'bia', guestId: ME.id };

    expect(
      renderHookWithContext(() =>
        useGameCounters({ match: guestMatch, playerKind: 'main' })
      ).result.current
    ).toEqual({ shotCounter: 2, killCounter: 1, points: 1 });
    expect(
      renderHookWithContext(() =>
        useGameCounters({ match: guestMatch, playerKind: 'opponent' })
      ).result.current.points
    ).toBe(9);
  });

  it('is all zero without a game', () => {
    expect(
      renderHookWithContext(() => useGameCounters({ playerKind: 'main' }))
        .result.current
    ).toEqual({ shotCounter: 0, killCounter: 0, points: 0 });
  });
});

describe('useGameCounterTriggers', () => {
  function setup(difficulty: 'easy' | 'hard' = 'easy') {
    const onShot = vi.fn();
    const onHit = vi.fn();
    const hook = renderHookWithContext(() =>
      useGameCounterTriggers({ onShot, onHit, difficulty })
    );
    return { onShot, onHit, ...hook };
  }

  it('creates bats that score while the score is on', () => {
    const { result, onHit } = setup();

    result.current.createControlledBat();
    const options = createBat.mock.calls[0][0];
    expect(options).toMatchObject({ type: 'normal', withPoints: false });

    options.onHit('normal');
    expect(onHit).toHaveBeenCalledWith('normal');

    act(() => result.current.setIsScoreEnabled(false));
    options.onHit('normal');
    expect(onHit).toHaveBeenCalledTimes(1);
  });

  it('floats points in the hard mode', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const { result } = setup('hard');

    result.current.createControlledBat();

    expect(createBat.mock.calls[0][0]).toMatchObject({ withPoints: true });
  });

  it('counts a shot only in game mode, on target, with the score on', () => {
    const gameMode = vi.spyOn(gameService, 'getIsGameModeOn');
    const onTarget = vi.spyOn(shotService, 'isShotEnabled');
    const { result, onShot, unmount } = setup();
    const shoot = () =>
      document.body.onpointerdown!(new MouseEvent('pointerdown') as never);

    gameMode.mockReturnValue(true);
    onTarget.mockReturnValue(true);
    shoot();
    expect(onShot).toHaveBeenCalledTimes(1);

    onTarget.mockReturnValue(false);
    shoot();
    gameMode.mockReturnValue(false);
    onTarget.mockReturnValue(true);
    shoot();
    gameMode.mockReturnValue(true);
    act(() => result.current.setIsScoreEnabled(false));
    shoot();
    expect(onShot).toHaveBeenCalledTimes(1);

    unmount();
    expect(document.body.onpointerdown).toBeNull();
  });
});

describe('useGameMode', () => {
  it('runs onStart when the state changes, not when the modes are rebuilt', () => {
    const ready = vi.fn();
    const play = vi.fn();
    const { result, rerender } = renderHookWithContext(
      ({ state }: { state: 'ready' | 'play' }) =>
        useGameMode(
          {
            ready: { onStart: ready, label: 'Ready' },
            play: { onStart: play, label: 'Go' },
          },
          state
        ),
      { initialProps: { state: 'ready' as 'ready' | 'play' } }
    );

    expect(result.current.label).toBe('Ready');
    expect(ready).toHaveBeenCalledTimes(1);

    rerender({ state: 'ready' });
    expect(ready).toHaveBeenCalledTimes(1);

    rerender({ state: 'play' });
    expect(play).toHaveBeenCalledTimes(1);
    expect(result.current.label).toBe('Go');
  });
});

describe('useCountdown', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('counts down every second and calls back at zero', () => {
    const onFinish = vi.fn();
    const { result } = renderHookWithContext(() => useCountdown(onFinish));

    act(() => result.current.startCountdown(2));
    expect(result.current.countdownTime).toBe(2);

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.countdownTime).toBe(1);
    expect(onFinish).not.toHaveBeenCalled();

    act(() => vi.advanceTimersByTime(1000));
    expect(result.current.countdownTime).toBe(0);
    expect(onFinish).toHaveBeenCalledTimes(1);

    act(() => vi.advanceTimersByTime(3000));
    expect(onFinish).toHaveBeenCalledTimes(1);
  });

  it('stops and resets', () => {
    const onFinish = vi.fn();
    const { result, unmount } = renderHookWithContext(() =>
      useCountdown(onFinish)
    );

    act(() => result.current.startCountdown(5));
    act(() => result.current.stopCountdown());
    act(() => vi.advanceTimersByTime(10000));

    expect(result.current.countdownTime).toBe(0);
    expect(onFinish).not.toHaveBeenCalled();
    unmount();
  });
});

describe('useBatSpawner', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  // A fake createBat that really adds a bat, so the population is countable
  const addBat = () => {
    const div = document.createElement('div');
    div.className = 'flying-bat';
    document.body.appendChild(div);
  };

  it('does nothing while inactive', () => {
    const spawn = vi.fn(addBat);
    renderHookWithContext(() => useBatSpawner(spawn, false));

    act(() => vi.advanceTimersByTime(5000));

    expect(spawn).not.toHaveBeenCalled();
  });

  it('fills the sky, then refills up to 3 bats a second', () => {
    const spawn = vi.fn(addBat);
    const { unmount } = renderHookWithContext(() => useBatSpawner(spawn, true));
    expect(spawn).toHaveBeenCalledTimes(30);

    act(() => vi.advanceTimersByTime(1000));
    expect(spawn).toHaveBeenCalledTimes(30);

    document.querySelectorAll('.flying-bat').forEach((bat, i) => {
      if (i < 5) bat.remove();
    });
    act(() => vi.advanceTimersByTime(1000));
    expect(spawn).toHaveBeenCalledTimes(33);
    act(() => vi.advanceTimersByTime(1000));
    expect(spawn).toHaveBeenCalledTimes(35);

    unmount();
    document.querySelector('.flying-bat')!.remove();
    act(() => vi.advanceTimersByTime(3000));
    expect(spawn).toHaveBeenCalledTimes(35);
  });
});
