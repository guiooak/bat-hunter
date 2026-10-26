import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let dir: string | undefined;

afterEach(() => {
  if (dir) rmSync(dir, { recursive: true, force: true });
  dir = undefined;
});

async function migrate(db: unknown) {
  dir = mkdtempSync(join(tmpdir(), 'bh-migration-'));
  const file = join(dir, 'db.json');
  writeFileSync(file, JSON.stringify(db));
  process.argv = ['node', 'migration.mjs', file];
  const write = vi
    .spyOn(process.stdout, 'write')
    .mockImplementation(() => true);
  const error = vi.spyOn(console, 'error').mockImplementation(() => {});

  vi.resetModules();
  await import('./2026-10-private-nodes.mjs');

  return {
    update: JSON.parse(String(write.mock.calls[0][0])),
    summary: error.mock.calls[0][0],
  };
}

describe('private nodes migration', () => {
  it('copies profiles, first-name match lists and invitations', async () => {
    vi.spyOn(Date, 'now').mockReturnValue(42);
    const { update, summary } = await migrate({
      users: {
        u1: {
          name: 'Ana Maria',
          picture: 'p',
          away: 1,
          lastPulseAt: 5,
          matches: {
            m1: {
              hostId: 'u1',
              guestId: 'u2',
              hostName: 'Ana Maria',
              guestName: 'Bia Souza',
              createdAt: 7,
            },
            m2: { hostId: 'u3', guestId: 'u1', createdAt: 8 },
          },
        },
        u2: { firstName: 'Bia' },
      },
      matches: {
        m1: { hostId: 'u1', guestId: 'u2', createdAt: 7 },
        m3: { hostId: 'u1' },
        broken: { guestId: 'u2' },
        empty: null,
      },
    });

    expect(update).toEqual({
      'publicProfiles/u1': {
        firstName: 'Ana',
        picture: 'p',
        away: true,
        lastPulseAt: 5,
      },
      'publicProfiles/u2': {
        firstName: 'Bia',
        picture: '',
        away: false,
        lastPulseAt: 0,
      },
      'userMatches/u1/m1': {
        matchId: 'm1',
        hostId: 'u1',
        guestId: 'u2',
        hostName: 'Ana',
        guestName: 'Bia',
        createdAt: 7,
      },
      'userMatches/u1/m2': {
        matchId: 'm2',
        hostId: 'u3',
        guestId: 'u1',
        hostName: '',
        guestName: '',
        createdAt: 8,
      },
      'invitations/m1': { hostId: 'u1', createdAt: 7, guestId: 'u2' },
      'invitations/m3': { hostId: 'u1', createdAt: 42 },
    });
    expect(summary).toBe('publicProfiles: 2, userMatches: 2, invitations: 2');
  });

  it('handles an empty database', async () => {
    const { update, summary } = await migrate(null);

    expect(update).toEqual({});
    expect(summary).toBe('publicProfiles: 0, userMatches: 0, invitations: 0');
  });
});
