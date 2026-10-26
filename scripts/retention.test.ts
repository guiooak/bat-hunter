import { beforeEach, describe, expect, it, vi } from 'vitest';

const DAY = 24 * 60 * 60 * 1000;
const NOW = Date.UTC(2026, 9, 23);
const daysAgo = (days: number) => NOW - days * DAY;

type AuthUser = {
  uid: string;
  metadata: { lastSignInTime?: string; creationTime?: string };
};

const admin = vi.hoisted(() => ({
  data: {} as Record<string, unknown>,
  pages: [] as { users: AuthUser[]; pageToken?: string }[],
  listError: null as null | { code?: string; message: string },
  update: vi.fn(() => Promise.resolve()),
  deleteUser: vi.fn(() => Promise.resolve()),
}));

vi.mock('firebase-admin/app', () => ({
  initializeApp: vi.fn(),
  applicationDefault: vi.fn(),
}));
vi.mock('firebase-admin/database', () => ({
  getDatabase: () => ({
    ref: (path?: string) => ({
      get: async () => ({
        val: () => (path ? (admin.data[path] ?? null) : null),
      }),
      update: admin.update,
    }),
  }),
}));
vi.mock('firebase-admin/auth', () => ({
  getAuth: () => ({
    listUsers: async (_max: number, token?: string) => {
      if (admin.listError) throw admin.listError;
      return admin.pages[token ? Number(token) : 0];
    },
    deleteUser: admin.deleteUser,
  }),
}));

async function run(apply = false) {
  vi.resetModules();
  process.argv = ['node', 'retention.mjs', ...(apply ? ['--apply'] : [])];
  const log = vi.spyOn(console, 'log').mockImplementation(() => {});
  const table = vi.spyOn(console, 'table').mockImplementation(() => {});
  vi.spyOn(process, 'exit').mockImplementation((() => undefined) as never);

  await import('./retention.mjs');

  return {
    counts: table.mock.calls[0][0],
    logs: log.mock.calls.map((call) => String(call[0])),
    update: (admin.update.mock.calls[0] as unknown[] | undefined)?.[0],
  };
}

const user = (
  uid: string,
  lastSignInDaysAgo?: number,
  createdDaysAgo = 1000
) => ({
  uid,
  metadata: {
    lastSignInTime:
      lastSignInDaysAgo === undefined
        ? undefined
        : new Date(daysAgo(lastSignInDaysAgo)).toUTCString(),
    creationTime: new Date(daysAgo(createdDaysAgo)).toUTCString(),
  },
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers({ now: NOW });
  admin.data = {};
  admin.pages = [{ users: [] }];
  admin.listError = null;
  process.env.FIREBASE_DATABASE_URL = 'https://db';
});

describe('retention', () => {
  it('reports without deleting on a dry run, also with an empty database', async () => {
    const { counts, logs } = await run();

    expect(logs[0]).toBe('Dry run, nothing deleted:');
    expect(counts).toEqual({
      oldMatches: 0,
      unjoinedMatches: 0,
      orphanInvitations: 0,
      chatMessages: 0,
      inactiveAccounts: 0,
    });
    expect(admin.update).not.toHaveBeenCalled();
  });

  it('applies with nothing to delete', async () => {
    const { logs } = await run(true);

    expect(admin.update).not.toHaveBeenCalled();
    expect(logs.at(-1)).toBe('Done: 0 paths updated.');
  });

  it('deletes old matches, unjoined invitations and old messages', async () => {
    admin.data = {
      matches: {
        unjoinedOld: { hostId: 'h', createdAt: daysAgo(8) },
        unjoinedNoDate: { hostId: 'h' },
        unjoinedNew: { hostId: 'h', createdAt: daysAgo(1) },
        old: { hostId: 'h', guestId: 'g', createdAt: daysAgo(400) },
        oldOrphan: { guestId: 'g', createdAt: daysAgo(400) },
        oldNoPlayers: { guestId: '', createdAt: daysAgo(400), x: 1 },
        live: {
          hostId: 'h',
          guestId: 'g',
          createdAt: daysAgo(10),
          messages: {
            old: { createdAt: daysAgo(91) },
            noDate: {},
            fresh: { createdAt: daysAgo(1) },
          },
        },
      },
      invitations: { live: {}, gone: {}, old: {} },
    };

    const { counts, logs, update } = await run(true);

    expect(logs[0]).toBe('Applying retention:');
    expect(counts).toEqual({
      oldMatches: 2,
      unjoinedMatches: 3,
      orphanInvitations: 1,
      chatMessages: 2,
      inactiveAccounts: 0,
    });
    expect(update).toEqual({
      'matches/unjoinedOld': null,
      'invitations/unjoinedOld': null,
      'userMatches/h/unjoinedOld': null,
      'matches/unjoinedNoDate': null,
      'invitations/unjoinedNoDate': null,
      'userMatches/h/unjoinedNoDate': null,
      'matches/old': null,
      'invitations/old': null,
      'userMatches/h/old': null,
      'userMatches/g/old': null,
      'matches/oldOrphan': null,
      'invitations/oldOrphan': null,
      'userMatches/g/oldOrphan': null,
      'matches/oldNoPlayers': null,
      'invitations/oldNoPlayers': null,
      'matches/live/messages/old': null,
      'matches/live/messages/noDate': null,
      'invitations/gone': null,
    });
    expect(logs.at(-1)).toBe('Done: 18 paths updated.');
  });

  it('deletes accounts without a sign-in for 24 months, page by page', async () => {
    admin.pages = [
      { users: [user('inactive', 800), user('active', 10)], pageToken: '1' },
      {
        users: [
          user('neverSignedIn', undefined, 900),
          user('brandNew', undefined, 1),
        ],
      },
    ];
    admin.data = {
      matches: {
        shared: { hostId: 'inactive', guestId: 'bia', createdAt: daysAgo(400) },
      },
      userMatches: {
        inactive: {
          asHost: { matchId: 'asHost', hostId: 'inactive', guestId: 'bia' },
          asGuest: { matchId: 'asGuest', hostId: 'caio', guestId: 'inactive' },
          alone: { matchId: 'alone', hostId: 'inactive', guestId: '' },
          shared: { matchId: 'shared', hostId: 'inactive', guestId: 'bia' },
        },
      },
    };

    const { counts, update } = await run(true);

    expect(counts.inactiveAccounts).toBe(2);
    expect(update).toMatchObject({
      'users/inactive': null,
      'publicProfiles/inactive': null,
      'userMatches/inactive': null,
      'userMatches/bia/asHost/hostName': 'Removed player',
      'userMatches/caio/asGuest/guestName': 'Removed player',
      'users/neverSignedIn': null,
    });
    // The shared match is deleted anyway: no rename, and no nested paths
    expect(update).not.toHaveProperty('userMatches/bia/shared/hostName');
    expect(update).not.toHaveProperty('userMatches/inactive/shared');
    expect(admin.deleteUser.mock.calls).toEqual([
      ['inactive'],
      ['neverSignedIn'],
    ]);
  });

  it('skips accounts when the service account cannot list them', async () => {
    admin.listError = { code: 'auth/insufficient-permission', message: 'no' };
    const first = await run();
    expect(first.logs).toContain(
      'Inactive accounts skipped: auth/insufficient-permission'
    );

    admin.listError = { message: 'network down' };
    const second = await run();
    expect(second.logs).toContain('Inactive accounts skipped: network down');
  });
});
