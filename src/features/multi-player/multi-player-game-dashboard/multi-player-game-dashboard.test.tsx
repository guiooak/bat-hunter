import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, screen } from '@testing-library/react';
import { ME, renderWithContext } from 'src/test/render';
import { MultiPlayerContext } from 'src/features/multi-player/multi-player-context';
import type { MatchType } from 'src/models/match-model';
import type { GameType } from 'src/models/game-model';
import type { BatType } from 'src/services/bat-types';
import type { UserSessionType } from 'src/services/auth-service';

const gameModel = vi.hoisted(() => ({
  createGameInFirebase: vi.fn(() => Promise.resolve('new')),
  setGameInFirebase: vi.fn(() => Promise.resolve()),
  setGameState: vi.fn(() => Promise.resolve()),
  setGameWinner: vi.fn(() => Promise.resolve()),
  setPlayerDataInFirebase: vi.fn(() => Promise.resolve()),
}));
vi.mock('src/models/game-model', async (importOriginal) => ({
  ...(await importOriginal<object>()),
  ...gameModel,
}));

type BatOptions = { type: BatType; onHit: (t: BatType) => void };
const bats = vi.hoisted(() => ({ created: [] as BatOptions[] }));
vi.mock('src/services/fly-engine-service', () => ({
  FLYING_BAT_IMG: 'bat.gif',
  createBat: (options: BatOptions) => {
    bats.created.push(options);
    const div = document.createElement('div');
    div.className = 'flying-bat';
    document.body.appendChild(div);
  },
}));

import { MultiPlayerGameDashboard } from '.';
import * as gameService from 'src/services/game-service';
import * as shotService from 'src/services/shot-service';
import { MultiPlayerGameDashboardController } from './_multi-player-game-dashboard-controller';

const BIA: UserSessionType = { id: 'bia', firstName: 'Bia', name: 'Bia' };

function game(overrides: Partial<GameType> = {}): GameType {
  return { id: 'g1', createdAt: 1, state: 'GAME_READY', ...overrides };
}

function buildMatch(
  games: Record<string, GameType> = {},
  host = ME.id!
): MatchType {
  return {
    id: 'm1',
    hostId: host,
    guestId: host === ME.id ? 'bia' : ME.id,
    games,
  };
}

// The dashboard reads the match from the context; rerender to mimic Firebase
function setup(match: MatchType | undefined) {
  const view = renderWithContext(<Harness match={match} />);
  return {
    ...view,
    update: (next: MatchType | undefined) =>
      view.rerender(<Harness match={next} />),
  };
}

function Harness({ match }: { match?: MatchType }) {
  return (
    <MultiPlayerContext.Provider
      value={{ match, opponentUser: BIA, isMatchPrivate: false }}
    >
      <MultiPlayerGameDashboard />
    </MultiPlayerContext.Provider>
  );
}

const click = (name: string) =>
  act(() => fireEvent.click(screen.getByRole('button', { name })));

beforeEach(() => {
  vi.clearAllMocks();
  bats.created.length = 0;
  vi.useFakeTimers();
});
afterEach(() => vi.useRealTimers());

describe('MultiPlayerGameDashboard as host', () => {
  it('creates the first game, keeping the last difficulty', async () => {
    setup(
      buildMatch({
        old: game({ id: 'old', state: 'GAME_CLOSED', difficulty: 'hard' }),
      })
    );

    await act(async () => {});

    expect(gameModel.createGameInFirebase).toHaveBeenCalledWith('m1', 'hard');
  });

  it('logs a failure to create the game', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    gameModel.createGameInFirebase.mockRejectedValueOnce(new Error('denied'));

    setup(buildMatch());
    await act(async () => {});

    expect(consoleError).toHaveBeenCalledWith(
      'ERROR: could not register new game in Firebase.',
      expect.any(Error)
    );
  });

  it('waits for an opponent before Start and History', () => {
    setup({ ...buildMatch({ g1: game() }), guestId: undefined });

    expect(screen.getByText('Get Ready!')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'History' })).toBeDisabled();
    expect(
      screen.getByText('Waiting for an opponent to join.')
    ).toBeInTheDocument();
  });

  it('picks the difficulty for the game', () => {
    setup(buildMatch({ g1: game() }));

    act(() => fireEvent.click(screen.getByRole('radio', { name: 'Hard' })));

    expect(gameModel.setGameInFirebase).toHaveBeenCalledWith({
      matchId: 'm1',
      data: { id: 'g1', difficulty: 'hard' },
    });
  });

  it('ignores a difficulty change before the game exists', () => {
    setup(buildMatch());

    act(() => fireEvent.click(screen.getByRole('radio', { name: 'Hard' })));

    expect(gameModel.setGameInFirebase).not.toHaveBeenCalled();
  });

  it('plays a game: start, score, time is up, winner', () => {
    const { update } = setup(buildMatch({ g1: game() }));
    expect(gameModel.setGameState).toHaveBeenLastCalledWith(
      'm1',
      'g1',
      'GAME_READY'
    );

    click('Start');
    expect(gameModel.setGameState).toHaveBeenLastCalledWith(
      'm1',
      'g1',
      'GAME_IN_PROGRESS'
    );
    expect(bats.created).toHaveLength(30);
    expect(screen.queryByRole('radiogroup')).toBeNull();

    update(buildMatch({ g1: game({ state: 'GAME_IN_PROGRESS' }) }));
    act(() => bats.created[0].onHit('normal'));
    expect(gameModel.setPlayerDataInFirebase).toHaveBeenLastCalledWith({
      matchId: 'm1',
      gameId: 'g1',
      player: 'host',
      data: { shotCounter: 0, killCounter: 1, points: 1 },
    });

    // The guest scored more
    update(
      buildMatch({
        g1: game({
          state: 'GAME_IN_PROGRESS',
          hostData: { shotCounter: 1, killCounter: 1 },
          guestData: { shotCounter: 2, killCounter: 2 },
        }),
      })
    );
    act(() => vi.advanceTimersByTime(60_000));
    expect(screen.getByText("Time's Up!")).toBeInTheDocument();
    expect(gameModel.setGameWinner).toHaveBeenCalledWith('m1', 'g1', 'bia');

    // Firebase sends the winner back: the result shows, then Play again
    update(
      buildMatch({ g1: game({ state: 'GAME_FINISHED', winnerId: 'bia' }) })
    );
    expect(screen.getByText('You lose! 💔')).toBeInTheDocument();
    click('✕');
    click('Play again');
    expect(gameModel.setGameInFirebase).toHaveBeenCalledWith({
      matchId: 'm1',
      data: { id: 'g1', state: 'GAME_CLOSED' },
    });
  });

  it('declares a draw or the host as winner', () => {
    const { update } = setup(buildMatch({ g1: game() }));
    click('Start');

    update(buildMatch({ g1: game({ state: 'GAME_IN_PROGRESS' }) }));
    act(() => vi.advanceTimersByTime(60_000));
    expect(gameModel.setGameWinner).toHaveBeenLastCalledWith(
      'm1',
      'g1',
      'DRAW'
    );

    click('Play again');
    update(
      buildMatch({ g1: game({ hostData: { shotCounter: 1, killCounter: 1 } }) })
    );
    click('Start');
    act(() => vi.advanceTimersByTime(60_000));
    expect(gameModel.setGameWinner).toHaveBeenLastCalledWith('m1', 'g1', ME.id);
  });

  it('cancels a game back to Get Ready', () => {
    setup(buildMatch({ g1: game() }));
    click('Start');

    click('Cancel');

    expect(screen.getByText('Get Ready!')).toBeInTheDocument();
    expect(gameModel.setGameState).toHaveBeenLastCalledWith(
      'm1',
      'g1',
      'GAME_READY'
    );
  });

  it('closes a finished game with a winner when the page loads', () => {
    setup(
      buildMatch({ g1: game({ state: 'GAME_FINISHED', winnerId: 'bia' }) })
    );

    expect(gameModel.setGameInFirebase).toHaveBeenCalledWith({
      matchId: 'm1',
      data: { id: 'g1', state: 'GAME_CLOSED' },
    });
    // With a winner the state is not overwritten
    expect(gameModel.setGameState).not.toHaveBeenCalled();
  });

  it('counts shots on target while playing', () => {
    vi.spyOn(gameService, 'getIsGameModeOn').mockReturnValue(true);
    vi.spyOn(shotService, 'isShotEnabled').mockReturnValue(true);
    const { update } = setup(buildMatch({ g1: game() }));
    click('Start');
    update(buildMatch({ g1: game({ state: 'GAME_IN_PROGRESS' }) }));

    act(() =>
      document.body.onpointerdown!(new MouseEvent('pointerdown') as never)
    );

    expect(gameModel.setPlayerDataInFirebase).toHaveBeenLastCalledWith(
      expect.objectContaining({
        data: { shotCounter: 1, killCounter: 0, points: 0 },
      })
    );
  });

  it('opens and closes the history', () => {
    setup(buildMatch({ g1: game() }));

    click('History');
    expect(screen.getByText('Games History')).toBeInTheDocument();
    click('✕');
    expect(screen.queryByText('Games History')).toBeNull();
  });

  it('logs failed writes', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    gameModel.setGameState.mockRejectedValue(new Error('x'));
    gameModel.setGameInFirebase.mockRejectedValue(new Error('x'));
    gameModel.setPlayerDataInFirebase.mockRejectedValue(new Error('x'));
    gameModel.setGameWinner.mockRejectedValue(new Error('x'));

    const { update } = setup(
      buildMatch({ g1: game({ state: 'GAME_FINISHED', winnerId: 'bia' }) })
    );
    update(buildMatch({ g1: game() }));
    act(() => fireEvent.click(screen.getByRole('radio', { name: 'Hard' })));
    click('Start');
    update(buildMatch({ g1: game({ state: 'GAME_IN_PROGRESS' }) }));
    act(() => bats.created[0].onHit('normal'));
    act(() => vi.advanceTimersByTime(60_000));
    await act(async () => {});

    expect(consoleError).toHaveBeenCalledWith(
      'MultiPlayerGameDashboard::ERROR: Firebase write failed',
      expect.any(Error)
    );
    gameModel.setGameState.mockReset();
    gameModel.setGameInFirebase.mockReset();
    gameModel.setPlayerDataInFirebase.mockReset();
    gameModel.setGameWinner.mockReset();
  });
});

describe('Firebase round trips', () => {
  // Every write comes back as a new match object, like the real listener
  function LiveHarness({ initial }: { initial: MatchType }) {
    const [match, setMatch] = React.useState(initial);
    gameModel.setGameState.mockImplementation(async () => {
      // Bounded, so a regression fails instead of hanging the suite
      if (gameModel.setGameState.mock.calls.length > 5) return;
      setMatch((current) => ({ ...current, games: { ...current.games } }));
    });
    return <Harness match={match} />;
  }

  it('writes the game state once per state change, not on every render', async () => {
    renderWithContext(<LiveHarness initial={buildMatch({ g1: game() })} />);
    await act(async () => {});

    expect(gameModel.setGameState.mock.calls.length).toBeLessThanOrEqual(1);
    gameModel.setGameState.mockReset();
  });
});

describe('MultiPlayerGameDashboard as guest', () => {
  it('follows the host, sees the difficulty and saves its own score', () => {
    const { update } = setup(buildMatch({ g1: game() }, 'bia'));

    expect(screen.getByText('Host picks')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Start' })).toBeNull();
    expect(gameModel.createGameInFirebase).not.toHaveBeenCalled();

    update(buildMatch({ g1: game({ state: 'GAME_IN_PROGRESS' }) }, 'bia'));
    expect(screen.queryByRole('button', { name: 'Cancel' })).toBeNull();
    act(() => bats.created[0].onHit('normal'));
    expect(gameModel.setPlayerDataInFirebase).toHaveBeenLastCalledWith(
      expect.objectContaining({ player: 'guest' })
    );

    update(
      buildMatch(
        { g1: game({ state: 'GAME_FINISHED', winnerId: ME.id }) },
        'bia'
      )
    );
    expect(screen.getByText('You Win! 🎉')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Play again' })).toBeNull();
    expect(gameModel.setGameWinner).not.toHaveBeenCalled();

    // A closed game is no longer the current one: the guest gets ready for
    // the next game the host creates
    update(
      buildMatch({ g1: game({ state: 'GAME_CLOSED', winnerId: ME.id }) }, 'bia')
    );
    expect(screen.getByText('Get Ready!')).toBeInTheDocument();
  });

  it('shows nothing to do without a match', () => {
    setup(undefined);

    expect(screen.getByText('Get Ready!')).toBeInTheDocument();
  });
});

describe('MultiPlayerGameDashboardController', () => {
  it('shows a closed game to the guest', () => {
    renderWithContext(
      <MultiPlayerGameDashboardController
        difficulty="easy"
        remoteGameState="GAME_CLOSED"
        onResetScore={vi.fn()}
        onShot={vi.fn()}
        onHit={vi.fn()}
        onOpenHistory={vi.fn()}
        onStateChange={vi.fn()}
        onDifficultyChange={vi.fn()}
      />
    );

    expect(screen.getByText('Game Closed')).toBeInTheDocument();
    expect(screen.queryByRole('button')).toBeNull();
  });
});
