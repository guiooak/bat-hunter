import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { MatchType } from 'src/models/match-model';

async function loadGame() {
  vi.resetModules();
  const audio = await import('./audio-service');
  const playBackgroundMusic = vi.spyOn(audio, 'playBackgroundMusic');
  const pauseAllBackgroundMusic = vi.spyOn(audio, 'pauseAllBackgroundMusic');
  const game = await import('./game-service');
  return { ...game, playBackgroundMusic, pauseAllBackgroundMusic };
}

describe('game mode', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('enables the game: music, crosshair and the game flag', async () => {
    const game = await loadGame();

    game.enableBatGame();

    expect(game.getIsGameModeOn()).toBe(true);
    expect(game.playBackgroundMusic).toHaveBeenCalled();
    expect(document.body.style.cursor).toContain('aim.png');
  });

  it('disables the game, clearing the cursor a moment later', async () => {
    const game = await loadGame();
    game.enableBatGame();

    game.disableBatGame();

    expect(game.getIsGameModeOn()).toBe(false);
    expect(game.pauseAllBackgroundMusic).toHaveBeenCalled();
    expect(document.body.style.cursor).not.toBe('');
    vi.advanceTimersByTime(200);
    expect(document.body.style.cursor).toBe('');
  });

  it('a game started right after another one ended keeps its crosshair', async () => {
    const game = await loadGame();

    game.disableBatGame();
    vi.advanceTimersByTime(50);
    game.enableBatGame();
    vi.advanceTimersByTime(200);

    expect(document.body.style.cursor).toContain('aim.png');
  });

  it('shows only the crosshair, with no music or score', async () => {
    const game = await loadGame();
    game.enableBatGame();

    game.enableAimOnly();
    expect(game.getIsGameModeOn()).toBe(false);
    expect(game.pauseAllBackgroundMusic).toHaveBeenCalled();
    expect(document.body.style.cursor).toContain('aim.png');

    game.disableAimOnly();
    expect(document.body.style.cursor).toBe('');
  });

  it('sets and clears the body pointer handler', async () => {
    const game = await loadGame();
    const cb = vi.fn();

    game.setBodyOnClick(cb);
    expect(document.body.onpointerdown).toBe(cb);

    game.setBodyOnClick(null);
    expect(document.body.onpointerdown).toBeNull();
  });
});

describe('scoring', () => {
  it('accuracy is 100% before the first shot', async () => {
    const { calcAccuracy } = await loadGame();

    expect(calcAccuracy(0, 0)).toBe(100);
    expect(calcAccuracy(3, 2)).toBe(67);
  });

  it('final score is points times accuracy', async () => {
    const { calcFinalScore } = await loadGame();

    expect(calcFinalScore(4, 3, 9)).toBe(75 * 9);
  });

  it('final score falls back to kills, then to zero', async () => {
    const { calcFinalScore } = await loadGame();

    expect(calcFinalScore(2, 2)).toBe(200);
    expect(calcFinalScore()).toBe(0);
  });

  it('reducers count and reset', async () => {
    const { counterReducer, pointsReducer } = await loadGame();

    expect(counterReducer(2, 'add')).toBe(3);
    expect(counterReducer(2, 'reset')).toBe(0);
    expect(pointsReducer(2, 10)).toBe(12);
    expect(pointsReducer(2, -5)).toBe(-3);
    expect(pointsReducer(7, 'reset')).toBe(0);
  });

  it('a hit counts a kill and its points, except the owl', async () => {
    const { scoreHit } = await loadGame();
    const addKill = vi.fn();
    const addPoints = vi.fn();

    scoreHit('golden', { addKill, addPoints });
    expect(addKill).toHaveBeenCalledTimes(1);
    expect(addPoints).toHaveBeenCalledWith(10);

    scoreHit('owl', { addKill, addPoints });
    expect(addKill).toHaveBeenCalledTimes(1);
    expect(addPoints).toHaveBeenLastCalledWith(-5);
  });
});

describe('bats and games', () => {
  it('removes every flying bat', async () => {
    const { killAllBats } = await loadGame();
    document.body.innerHTML =
      '<div class="flying-bat"></div><div class="flying-bat"></div><p></p>';

    killAllBats();

    expect(document.querySelectorAll('.flying-bat')).toHaveLength(0);
    expect(document.querySelector('p')).not.toBeNull();
  });

  it('finds the game that is not closed yet', async () => {
    const { findCurrentGame } = await loadGame();
    const match: MatchType = {
      id: 'm',
      games: {
        a: { id: 'a', state: 'GAME_CLOSED' },
        b: { id: 'b', state: 'GAME_READY' },
      },
    };

    expect(findCurrentGame(match)?.id).toBe('b');
    expect(findCurrentGame({ id: 'm' })).toBeUndefined();
    expect(findCurrentGame()).toBeUndefined();
  });

  it('finds the most recent game', async () => {
    const { findLastGame } = await loadGame();
    const match: MatchType = {
      id: 'm',
      games: { a: { id: 'a', createdAt: 1 }, b: { id: 'b', createdAt: 2 } },
    };

    expect(findLastGame(match)?.id).toBe('b');
    expect(findLastGame()).toBeUndefined();
  });
});
