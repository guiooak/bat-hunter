import { beforeEach, describe, expect, it, vi } from 'vitest';
import { firebaseMock as fb } from 'src/test/firebase-mock';
import type { UserMatchType } from 'src/models/user-model';
import type { MatchType } from 'src/models/match-model';

vi.mock('src/services/firebase-service', async () => {
  const { firebaseMock } = await import('src/test/firebase-mock');
  return firebaseMock;
});

const authMock = vi.hoisted(() => ({
  getAuthAccountInfo: vi.fn(() => ({ email: 'me@example.com' })),
  deleteCurrentAuthUser: vi.fn(() => Promise.resolve()),
}));
vi.mock('src/services/auth-service', () => authMock);

import {
  buildAccountExport,
  deleteAccount,
  getAccountSummary,
  REMOVED_PLAYER_NAME,
} from './account-service';

const ME = 'me';

const hostEntry: UserMatchType = {
  matchId: 'm1',
  hostId: ME,
  hostName: 'Me',
  guestId: 'bia',
  guestName: 'Bia',
  createdAt: Date.UTC(2026, 0, 1),
};
const guestEntry: UserMatchType = {
  matchId: 'm2',
  hostId: 'caio',
  hostName: 'Caio',
  guestId: ME,
  guestName: 'Me',
  createdAt: Date.UTC(2026, 0, 2),
};

const m1: MatchType = {
  id: 'm1',
  games: {
    g1: {
      id: 'g1',
      createdAt: Date.UTC(2026, 0, 1),
      state: 'GAME_CLOSED',
      difficulty: 'hard',
      winnerId: ME,
      hostData: { shotCounter: 4, killCounter: 3, points: 9 },
      guestData: { shotCounter: 9, killCounter: 9, points: 50 },
    },
    g2: { id: 'g2', state: 'GAME_READY' },
    g3: {
      id: 'g3',
      winnerId: 'DRAW',
      hostData: { shotCounter: 2, killCounter: 2 },
    },
    g4: { id: 'g4', winnerId: 'bia' },
  },
  messages: {
    a: {
      id: 'a',
      authorId: ME,
      message: 'hi',
      createdAt: Date.UTC(2026, 0, 1),
    },
    b: { id: 'b', authorId: 'bia', message: 'secret' },
    c: { id: 'c', authorId: ME, message: 'no date' },
  },
};

// userMatches/me has two entries; m1 is readable, m2 is gone (retention)
function mockData() {
  fb.getData.mockImplementation((path: string) => {
    if (path === `userMatches/${ME}`) {
      return Promise.resolve({ m1: hostEntry, m2: guestEntry });
    }
    if (path === 'matches/m1') return Promise.resolve(m1);
    if (path === 'matches/m2') return Promise.reject(new Error('gone'));
    if (path === `users/${ME}`) return Promise.resolve({ id: ME });
    if (path === `publicProfiles/${ME}`)
      return Promise.resolve({ firstName: 'Me' });
    return Promise.resolve(null);
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  mockData();
});

describe('getAccountSummary', () => {
  it('counts matches, own messages and local preferences', async () => {
    localStorage.setItem('bh-difficulty', '"hard"');
    localStorage.setItem('bh-background-music-muted', '{broken');

    await expect(getAccountSummary(ME)).resolves.toEqual({
      matches: 2,
      messages: 2,
      preferences: { 'bh-difficulty': 'hard' },
    });
  });
});

describe('buildAccountExport', () => {
  it("exports the player's own data only", async () => {
    vi.useFakeTimers({ now: Date.UTC(2026, 9, 23) });
    const data = await buildAccountExport(ME);
    vi.useRealTimers();

    expect(data.exportedAt).toBe('2026-10-23T00:00:00.000Z');
    expect(data.controller.contact).toBe('game.bat.hunter@gmail.com');
    expect(data.account).toEqual({ id: ME });
    expect(data.signIn).toEqual({ email: 'me@example.com' });
    expect(data.publicProfile).toEqual({ firstName: 'Me' });
    expect(data.browserPreferences).toEqual({});

    const [asHost, asGuest] = data.matches;
    expect(asHost).toMatchObject({
      matchId: 'm1',
      role: 'host',
      opponent: 'Bia',
    });
    expect(asGuest).toMatchObject({
      matchId: 'm2',
      role: 'guest',
      opponent: 'Caio',
      games: [],
      messages: [],
    });

    expect(asHost.games).toEqual([
      {
        id: 'g1',
        createdAt: '2026-01-01T00:00:00.000Z',
        state: 'GAME_CLOSED',
        difficulty: 'hard',
        shots: 4,
        kills: 3,
        points: 9,
        finalScore: 75 * 9,
        result: 'win',
      },
      {
        id: 'g2',
        createdAt: undefined,
        state: 'GAME_READY',
        difficulty: 'easy',
        shots: 0,
        kills: 0,
        points: 0,
        finalScore: 0,
        result: null,
      },
      expect.objectContaining({ id: 'g3', points: 2, result: 'draw' }),
      expect.objectContaining({ id: 'g4', result: 'loss' }),
    ]);

    // The opponent's message is not exported
    expect(asHost.messages).toEqual([
      { id: 'a', sentAt: '2026-01-01T00:00:00.000Z', text: 'hi' },
      { id: 'c', sentAt: '1970-01-01T00:00:00.000Z', text: 'no date' },
    ]);
  });

  it('exports the guest side of a readable match', async () => {
    fb.getData.mockImplementation((path: string) =>
      Promise.resolve(
        path === `userMatches/${ME}`
          ? { m1: { ...hostEntry, hostId: 'bia', guestId: ME } }
          : path === 'matches/m1'
            ? m1
            : null
      )
    );

    const data = await buildAccountExport(ME);

    expect(data.matches[0].games[0]).toMatchObject({ shots: 9, points: 50 });
  });
});

describe('the language (LGPD)', () => {
  it('is in the export, from the account and from this browser', async () => {
    fb.getData.mockImplementation((path: string) =>
      Promise.resolve(
        path === `users/${ME}` ? { id: ME, language: 'pt-BR' } : null
      )
    );
    localStorage.setItem('bh-language', '"pt-BR"');

    const data = await buildAccountExport(ME);

    expect(data.account).toEqual({ id: ME, language: 'pt-BR' });
    expect(data.browserPreferences).toEqual({ 'bh-language': 'pt-BR' });
  });

  it('goes with the account and the browser preferences', async () => {
    localStorage.setItem('bh-language', '"pt-BR"');

    await deleteAccount(ME);

    // users/$uid holds the language: the whole node is removed
    expect(fb.removeData).toHaveBeenCalledWith(`users/${ME}`);
    expect(localStorage.getItem('bh-language')).toBeNull();
  });
});

describe('deleteAccount', () => {
  it('erases messages, profile, list, preferences and the sign-in', async () => {
    localStorage.setItem('bh-difficulty', '"hard"');

    await deleteAccount(ME);

    expect(fb.removeData.mock.calls.map((call) => String(call[0]))).toEqual([
      'matches/m1/messages/a',
      'matches/m1/messages/c',
      `userMatches/${ME}`,
      `publicProfiles/${ME}`,
      `users/${ME}`,
    ]);
    // Only the opponent of the readable match is updated, as removed player
    expect(fb.updateData).toHaveBeenCalledTimes(1);
    expect(fb.updateData).toHaveBeenCalledWith('userMatches/bia/m1', {
      ...hostEntry,
      hostName: REMOVED_PLAYER_NAME,
    });
    expect(localStorage.getItem('bh-difficulty')).toBeNull();
    expect(authMock.deleteCurrentAuthUser).toHaveBeenCalled();
  });

  it('marks the guest name when the player was the guest', async () => {
    fb.getData.mockImplementation((path: string) =>
      Promise.resolve(
        path === `userMatches/${ME}`
          ? { m2: guestEntry }
          : path === 'matches/m2'
            ? {}
            : null
      )
    );

    await deleteAccount(ME);

    expect(fb.updateData).toHaveBeenCalledWith('userMatches/caio/m2', {
      ...guestEntry,
      guestName: REMOVED_PLAYER_NAME,
    });
  });

  it('skips entries without an opponent', async () => {
    fb.getData.mockImplementation((path: string) =>
      Promise.resolve(
        path === `userMatches/${ME}`
          ? { m1: { ...hostEntry, guestId: '' } }
          : path === 'matches/m1'
            ? {}
            : null
      )
    );

    await deleteAccount(ME);

    expect(fb.updateData).not.toHaveBeenCalled();
  });

  it('goes on when the opponent list or the storage fails', async () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    fb.updateData.mockRejectedValueOnce(new Error('denied'));
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    await deleteAccount(ME);

    expect(consoleError).toHaveBeenCalledWith(
      'deleteAccount: opponent list not updated',
      expect.any(Error)
    );
    expect(authMock.deleteCurrentAuthUser).toHaveBeenCalled();
  });
});
