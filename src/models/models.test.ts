import { beforeEach, describe, expect, it, vi } from 'vitest';
import { firebaseMock as fb } from 'src/test/firebase-mock';

vi.mock('src/services/firebase-service', async () => {
  const { firebaseMock } = await import('src/test/firebase-mock');
  return firebaseMock;
});
vi.mock('uuid', () => ({ v7: () => 'new-id' }));

import {
  createGameInFirebase,
  setGameInFirebase,
  setGameState,
  setGameWinner,
  setPlayerDataInFirebase,
} from './game-model';
import {
  createMatchInFirebase,
  getInvitationFromFirebase,
  getMatchDataReactivelyFromFirebase,
  joinMatchInFirebase,
  setMatchInFirebase,
} from './match-model';
import { createMessageInFirebase } from './message-model';
import {
  getPublicProfileFromFirebase,
  getPublicProfileReactivelyFromFirebase,
  getUserMatchesFromFirebase,
  setPrivateUserInFirebase,
  setPublicProfileInFirebase,
  setUserMatchInFirebase,
} from './user-model';

beforeEach(() => {
  vi.clearAllMocks();
  vi.spyOn(Date, 'now').mockReturnValue(1000);
});

describe('game model', () => {
  it('creates a game, easy by default', async () => {
    await expect(createGameInFirebase('m1')).resolves.toBe('new-id');
    expect(fb.setData).toHaveBeenCalledWith('matches/m1/games/new-id', {
      id: 'new-id',
      createdAt: 1000,
      updatedAt: 1000,
      state: 'GAME_READY',
      difficulty: 'easy',
    });

    await createGameInFirebase('m1', 'hard');
    expect(fb.setData).toHaveBeenLastCalledWith(
      'matches/m1/games/new-id',
      expect.objectContaining({ difficulty: 'hard' })
    );
  });

  it('updates a game and a player score with the time', () => {
    setGameInFirebase({
      matchId: 'm1',
      data: { id: 'g1', state: 'GAME_CLOSED' },
    });
    expect(fb.updateData).toHaveBeenCalledWith('matches/m1/games/g1', {
      id: 'g1',
      state: 'GAME_CLOSED',
      updatedAt: 1000,
    });

    setPlayerDataInFirebase({
      matchId: 'm1',
      gameId: 'g1',
      player: 'guest',
      data: { shotCounter: 2, killCounter: 1, points: 3 },
    });
    expect(fb.updateData).toHaveBeenLastCalledWith(
      'matches/m1/games/g1/guestData',
      {
        shotCounter: 2,
        killCounter: 1,
        points: 3,
        updatedAt: 1000,
      }
    );
  });

  it('sets the winner and the state only with every id', () => {
    expect(setGameWinner()).toBeUndefined();
    expect(setGameWinner('m1', 'g1')).toBeUndefined();
    expect(setGameState('m1', undefined, 'GAME_READY')).toBeUndefined();
    expect(fb.updateData).not.toHaveBeenCalled();

    setGameWinner('m1', 'g1', 'u1');
    setGameState('m1', 'g1', 'GAME_FINISHED');
    expect(fb.updateData).toHaveBeenCalledWith(
      'matches/m1/games/g1',
      expect.objectContaining({ winnerId: 'u1' })
    );
    expect(fb.updateData).toHaveBeenCalledWith(
      'matches/m1/games/g1',
      expect.objectContaining({ state: 'GAME_FINISHED' })
    );
  });
});

describe('match model', () => {
  it('creates the match and its public invitation', async () => {
    await expect(createMatchInFirebase({ hostId: 'h1' })).resolves.toBe(
      'new-id'
    );

    expect(fb.updateData).toHaveBeenCalledWith('matches/new-id', {
      id: 'new-id',
      hostId: 'h1',
      createdAt: 1000,
    });
    expect(fb.updateData).toHaveBeenCalledWith('invitations/new-id', {
      hostId: 'h1',
      createdAt: 1000,
    });
  });

  it('reads an invitation', () => {
    getInvitationFromFirebase('m1');
    expect(fb.getData).toHaveBeenCalledWith('invitations/m1');
  });

  it('joins as the guest: the match first, then the invitation', async () => {
    await joinMatchInFirebase('m1', 'g1');

    expect(fb.updateData.mock.calls).toEqual([
      ['matches/m1', { id: 'm1', guestId: 'g1' }],
      ['invitations/m1', { guestId: 'g1' }],
    ]);
  });

  it('updates a match', () => {
    setMatchInFirebase({ id: 'm1', hostId: 'h1' });
    expect(fb.updateData).toHaveBeenCalledWith('matches/m1', {
      id: 'm1',
      hostId: 'h1',
    });
  });

  it('listens to a match, with undefined for a missing one', () => {
    const cb = vi.fn();
    const onDenied = vi.fn();
    getMatchDataReactivelyFromFirebase('m1', cb, onDenied);
    const [path, onData, onError] = fb.getReactively.mock.calls[0];

    expect(path).toBe('matches/m1');
    expect(onError).toBe(onDenied);
    onData({ id: 'm1' });
    expect(cb).toHaveBeenLastCalledWith({ id: 'm1' });
    onData(null);
    expect(cb).toHaveBeenLastCalledWith(undefined);
  });
});

describe('message model', () => {
  it('creates a chat message', async () => {
    await expect(
      createMessageInFirebase({ matchId: 'm1', authorId: 'u1', message: 'hi' })
    ).resolves.toBe('new-id');

    expect(fb.setData).toHaveBeenCalledWith('matches/m1/messages/new-id', {
      id: 'new-id',
      createdAt: 1000,
      authorId: 'u1',
      message: 'hi',
    });
  });
});

describe('user model', () => {
  it('writes the private user and the public profile', () => {
    setPrivateUserInFirebase({ id: 'u1', firstName: 'Ana', picture: 'p' });
    setPublicProfileInFirebase('u1', { away: true });

    expect(fb.updateData).toHaveBeenCalledWith('users/u1', {
      id: 'u1',
      firstName: 'Ana',
      picture: 'p',
    });
    expect(fb.updateData).toHaveBeenCalledWith('publicProfiles/u1', {
      away: true,
    });
  });

  it('reads a public profile', () => {
    getPublicProfileFromFirebase('u1');
    expect(fb.getData).toHaveBeenCalledWith('publicProfiles/u1');
  });

  it('listens to a public profile as a session-like user', () => {
    const cb = vi.fn();
    getPublicProfileReactivelyFromFirebase('u1', cb);
    const [path, onData] = fb.getReactively.mock.calls[0];

    expect(path).toBe('publicProfiles/u1');
    onData({ firstName: 'Ana', picture: 'p' });
    expect(cb).toHaveBeenLastCalledWith({
      firstName: 'Ana',
      picture: 'p',
      id: 'u1',
      name: 'Ana',
    });
    onData(null);
    expect(cb).toHaveBeenLastCalledWith(null);
  });

  it('writes and reads the private match list', async () => {
    const entry = {
      matchId: 'm1',
      hostId: 'h',
      hostName: 'Ana',
      guestId: 'g',
      guestName: 'Bia',
      createdAt: 1,
    };
    setUserMatchInFirebase('u1', entry);
    expect(fb.updateData).toHaveBeenCalledWith('userMatches/u1/m1', entry);

    fb.getData.mockResolvedValueOnce({ m1: entry });
    await expect(getUserMatchesFromFirebase('u1')).resolves.toEqual([entry]);
    expect(fb.getData).toHaveBeenLastCalledWith('userMatches/u1');

    fb.getData.mockResolvedValueOnce(null);
    await expect(getUserMatchesFromFirebase('u1')).resolves.toEqual([]);
  });
});
