// One-off migration for the LGPD plan (phase 2.1): copies the data into the
// private nodes. It only adds data; the old fields are removed by a later
// cleanup, once the app reads the new nodes.
//
// Usage:
//   firebase database:get / --project bat-hunter-game > db.json
//   node scripts/migrations/2026-10-private-nodes.mjs db.json > update.json
//   firebase database:update / update.json --project bat-hunter-game
import { readFileSync } from 'node:fs';

const db = JSON.parse(readFileSync(process.argv[2], 'utf8')) ?? {};
const users = db.users ?? {};
const matches = db.matches ?? {};
const update = {};

const firstNameOf = (name = '') => name.trim().split(' ')[0];

for (const [uid, user] of Object.entries(users)) {
  update[`publicProfiles/${uid}`] = {
    firstName: user.firstName || firstNameOf(user.name),
    picture: user.picture || '',
    away: Boolean(user.away),
    lastPulseAt: user.lastPulseAt || 0,
  };

  for (const [matchId, entry] of Object.entries(user.matches ?? {})) {
    update[`userMatches/${uid}/${matchId}`] = {
      matchId,
      hostId: entry.hostId,
      guestId: entry.guestId,
      // Only the first name is shown, so only the first name is kept
      hostName: firstNameOf(entry.hostName),
      guestName: firstNameOf(entry.guestName),
      createdAt: entry.createdAt,
    };
  }
}

for (const [matchId, match] of Object.entries(matches)) {
  if (!match?.hostId) continue;

  update[`invitations/${matchId}`] = {
    hostId: match.hostId,
    createdAt: match.createdAt || Date.now(),
    ...(match.guestId && { guestId: match.guestId }),
  };
}

process.stdout.write(JSON.stringify(update));

const count = (prefix) =>
  Object.keys(update).filter((key) => key.startsWith(prefix)).length;
console.error(
  `publicProfiles: ${count('publicProfiles/')}, userMatches: ${count('userMatches/')}, invitations: ${count('invitations/')}`
);
