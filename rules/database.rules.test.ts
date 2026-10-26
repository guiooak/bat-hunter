import { readFileSync } from 'node:fs';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';

// Who reads and writes what in the Realtime Database (LGPD plan, phase 2.1):
// profiles, match lists, matches and chats are private to their players.
let env: RulesTestEnvironment;

const HOST = 'host';
const GUEST = 'guest';
const OTHER = 'other';

const db = (uid?: string) =>
  (uid
    ? env.authenticatedContext(uid)
    : env.unauthenticatedContext()
  ).database();

async function seed(data: Record<string, unknown>) {
  await env.withSecurityRulesDisabled((context) =>
    context.database().ref().set(data)
  );
}

const match = (guestId?: string) => ({
  id: 'm1',
  hostId: HOST,
  ...(guestId && { guestId }),
  createdAt: 1,
});

beforeAll(async () => {
  env = await initializeTestEnvironment({
    projectId: 'demo-bat-hunter',
    database: { rules: readFileSync('database.rules.json', 'utf8') },
  });
});
afterAll(() => env.cleanup());
beforeEach(() => env.clearDatabase());

describe('private profile (users)', () => {
  beforeEach(() =>
    seed({ users: { [HOST]: { id: HOST, firstName: 'Ana', picture: 'p' } } })
  );

  it('only the owner reads and writes it', async () => {
    await assertSucceeds(db(HOST).ref(`users/${HOST}`).get());
    await assertFails(db(OTHER).ref(`users/${HOST}`).get());
    await assertFails(db().ref(`users/${HOST}`).get());
    await assertFails(db(OTHER).ref(`users/${HOST}/firstName`).set('x'));
    await assertSucceeds(db(HOST).ref(`users/${HOST}/firstName`).set('Ana'));
  });

  it('keeps the language the owner picked, and only a known one', async () => {
    await assertSucceeds(db(HOST).ref(`users/${HOST}/language`).set('pt-BR'));
    await assertSucceeds(db(HOST).ref(`users/${HOST}/language`).set('en-US'));
    await assertFails(db(HOST).ref(`users/${HOST}/language`).set('fr-FR'));
    await assertFails(db(OTHER).ref(`users/${HOST}/language`).set('pt-BR'));
    await assertFails(db(OTHER).ref(`users/${HOST}/language`).get());
  });

  it('keeps only id, first name, photo and language', async () => {
    await assertFails(db(HOST).ref(`users/${HOST}/email`).set('a@b.c'));
    await assertFails(db(HOST).ref(`users/${HOST}/id`).set('someone-else'));
  });

  it('nobody lists the users', async () => {
    await assertFails(db(HOST).ref('users').get());
  });
});

describe('public profile', () => {
  it('signed-in players read it; only the owner writes it', async () => {
    await assertSucceeds(
      db(HOST)
        .ref(`publicProfiles/${HOST}`)
        .set({ firstName: 'Ana', away: false })
    );
    await assertSucceeds(db(OTHER).ref(`publicProfiles/${HOST}`).get());
    await assertFails(db().ref(`publicProfiles/${HOST}`).get());
    await assertFails(db(OTHER).ref(`publicProfiles/${HOST}/away`).set(true));
    await assertFails(db(HOST).ref(`publicProfiles/${HOST}/email`).set('x'));
  });
});

describe('match lists (userMatches)', () => {
  const entry = {
    matchId: 'm1',
    hostId: HOST,
    guestId: GUEST,
    hostName: 'Ana',
    guestName: 'Bia',
    createdAt: 1,
  };

  beforeEach(() => seed({ matches: { m1: match(GUEST) } }));

  it('players of the match write both lists; only the owner reads', async () => {
    await assertSucceeds(db(GUEST).ref(`userMatches/${HOST}/m1`).set(entry));
    await assertSucceeds(db(GUEST).ref(`userMatches/${GUEST}/m1`).set(entry));
    await assertSucceeds(db(HOST).ref(`userMatches/${HOST}`).get());
    await assertFails(db(GUEST).ref(`userMatches/${HOST}`).get());
    await assertFails(db(OTHER).ref(`userMatches/${OTHER}/m1`).set(entry));
  });

  it('entries must match the match players', async () => {
    await assertFails(
      db(GUEST)
        .ref(`userMatches/${GUEST}/m1`)
        .set({ ...entry, hostId: OTHER })
    );
  });

  it('the owner can delete their whole list', async () => {
    await seed({
      matches: { m1: match(GUEST) },
      userMatches: { [HOST]: { m1: entry } },
    });

    await assertSucceeds(db(HOST).ref(`userMatches/${HOST}`).remove());
    await assertFails(db(GUEST).ref(`userMatches/${HOST}`).remove());
  });
});

describe('invitations', () => {
  it('the host creates it, anyone signed in reads it, one guest joins', async () => {
    await assertSucceeds(
      db(HOST).ref('invitations/m1').set({ hostId: HOST, createdAt: 1 })
    );
    await assertFails(
      db(OTHER).ref('invitations/m2').set({ hostId: HOST, createdAt: 1 })
    );
    await assertSucceeds(db(OTHER).ref('invitations/m1').get());
    await assertFails(db().ref('invitations/m1').get());

    await seed({
      matches: { m1: match(GUEST) },
      invitations: { m1: { hostId: HOST, createdAt: 1 } },
    });
    await assertFails(
      db(OTHER).ref('invitations/m1').update({ guestId: OTHER })
    );
    await assertSucceeds(
      db(GUEST).ref('invitations/m1').update({ guestId: GUEST })
    );
    await assertFails(
      db(OTHER).ref('invitations/m1').update({ guestId: OTHER })
    );
  });

  it('only the host deletes it', async () => {
    await seed({ invitations: { m1: { hostId: HOST, createdAt: 1 } } });

    await assertFails(db(GUEST).ref('invitations/m1').remove());
    await assertSucceeds(db(HOST).ref('invitations/m1').remove());
  });
});

describe('matches, games and chat', () => {
  beforeEach(() => seed({ matches: { m1: match(GUEST) } }));

  it('only its two players read a match', async () => {
    await assertSucceeds(db(HOST).ref('matches/m1').get());
    await assertSucceeds(db(GUEST).ref('matches/m1').get());
    await assertFails(db(OTHER).ref('matches/m1').get());
    await assertFails(db(OTHER).ref('matches').get());
  });

  it('a match is created by its host and joined once', async () => {
    await assertSucceeds(
      db(HOST).ref('matches/m2').set({ id: 'm2', hostId: HOST, createdAt: 1 })
    );
    await assertFails(
      db(OTHER).ref('matches/m3').set({ id: 'm3', hostId: HOST, createdAt: 1 })
    );
    // The guest joins later: a host can't put someone in a match (and then in
    // their match list) without them
    await assertFails(
      db(HOST)
        .ref('matches/m4')
        .set({ id: 'm4', hostId: HOST, guestId: GUEST, createdAt: 1 })
    );
    await assertFails(db(HOST).ref('matches/m2').update({ guestId: HOST }));
    await assertSucceeds(
      db(GUEST).ref('matches/m2').update({ guestId: GUEST })
    );
    await assertFails(db(OTHER).ref('matches/m2').update({ guestId: OTHER }));
  });

  it('the host runs the games; each player writes their own score', async () => {
    const game = db(HOST).ref('matches/m1/games/g1');
    await assertSucceeds(
      game.set({
        id: 'g1',
        createdAt: 1,
        updatedAt: 1,
        state: 'GAME_READY',
        difficulty: 'hard',
      })
    );
    await assertFails(
      db(GUEST).ref('matches/m1/games/g1/state').set('GAME_FINISHED')
    );
    await assertFails(
      db(HOST).ref('matches/m1/games/g1/difficulty').set('insane')
    );
    await assertFails(db(HOST).ref('matches/m1/games/g1/state').set('PAUSED'));

    await assertSucceeds(
      db(HOST)
        .ref('matches/m1/games/g1/hostData')
        .set({ shotCounter: 3, killCounter: 1, points: -4 })
    );
    await assertFails(
      db(HOST).ref('matches/m1/games/g1/hostData/points').set(10_000)
    );
    await assertSucceeds(
      db(GUEST)
        .ref('matches/m1/games/g1/guestData')
        .set({ shotCounter: 2, killCounter: 2, points: 13 })
    );
    await assertFails(
      db(GUEST).ref('matches/m1/games/g1/guestData/points').set(-10_000)
    );
    await assertFails(
      db(GUEST).ref('matches/m1/games/g1/hostData/points').set(5)
    );
    await assertFails(
      db(OTHER).ref('matches/m1/games/g1/guestData/points').set(5)
    );
  });

  it('players chat with their own name; each deletes only their messages', async () => {
    const message = (authorId: string) => ({
      id: 'x',
      authorId,
      message: 'hi',
      createdAt: 1,
    });

    await assertSucceeds(
      db(GUEST).ref('matches/m1/messages/x').set(message(GUEST))
    );
    await assertFails(
      db(GUEST)
        .ref('matches/m1/messages/y')
        .set({ ...message(HOST), id: 'y' })
    );
    await assertFails(
      db(OTHER)
        .ref('matches/m1/messages/z')
        .set({ ...message(OTHER), id: 'z' })
    );
    await assertFails(
      db(GUEST)
        .ref('matches/m1/messages/w')
        .set({ ...message(GUEST), id: 'w', message: '' })
    );

    await assertFails(db(HOST).ref('matches/m1/messages/x').remove());
    await assertSucceeds(db(GUEST).ref('matches/m1/messages/x').remove());
  });
});
