// Deletes data past its retention period (LGPD plan, phase 4). Runs every day
// on GitHub Actions (.github/workflows/retention.yml) with the CI service
// account. The periods come from src/services/retention-days.json, which the
// privacy policy reads too.
//
// Usage: node scripts/retention.mjs [--apply]
//   Without --apply it only reports what it would delete (dry run).
//   Needs GOOGLE_APPLICATION_CREDENTIALS and FIREBASE_DATABASE_URL.
//
// It prints counts only, never names, messages or IDs.
import { initializeApp, applicationDefault } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getDatabase } from 'firebase-admin/database';
// The same periods the app shows in its privacy policy
import RETENTION_DAYS from '../src/services/retention-days.json' with { type: 'json' };

const DAY = 24 * 60 * 60 * 1000;
const REMOVED_PLAYER_NAME = 'Removed player';

const apply = process.argv.includes('--apply');
const now = Date.now();
const olderThan = (timestamp, days) => (timestamp || 0) < now - days * DAY;

initializeApp({
  credential: applicationDefault(),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
});
const db = getDatabase();

const read = async (path) => (await db.ref(path).get()).val() ?? {};
const [matches, invitations, userMatches] = await Promise.all([
  read('matches'),
  read('invitations'),
  read('userMatches'),
]);

const update = {};
const counts = {
  oldMatches: 0,
  unjoinedMatches: 0,
  orphanInvitations: 0,
  chatMessages: 0,
  inactiveAccounts: 0,
};

function deleteMatch(matchId, match) {
  update[`matches/${matchId}`] = null;
  update[`invitations/${matchId}`] = null;
  if (match.hostId) update[`userMatches/${match.hostId}/${matchId}`] = null;
  if (match.guestId) update[`userMatches/${match.guestId}/${matchId}`] = null;
}

for (const [matchId, match] of Object.entries(matches)) {
  if (
    !match.guestId &&
    olderThan(match.createdAt, RETENTION_DAYS.unjoinedMatches)
  ) {
    deleteMatch(matchId, match);
    counts.unjoinedMatches++;
    continue;
  }

  if (olderThan(match.createdAt, RETENTION_DAYS.matches)) {
    deleteMatch(matchId, match);
    counts.oldMatches++;
    continue;
  }

  for (const [messageId, message] of Object.entries(match.messages ?? {})) {
    if (olderThan(message.createdAt, RETENTION_DAYS.chatMessages)) {
      update[`matches/${matchId}/messages/${messageId}`] = null;
      counts.chatMessages++;
    }
  }
}

for (const matchId of Object.keys(invitations)) {
  if (!matches[matchId]) {
    update[`invitations/${matchId}`] = null;
    counts.orphanInvitations++;
  }
}

// Accounts with no sign-in for too long: their data goes, and they show up as
// a removed player in their opponents' match lists.
const inactiveUids = [];
let authError = null;

try {
  let pageToken;
  do {
    const page = await getAuth().listUsers(1000, pageToken);
    for (const user of page.users) {
      const lastSignIn = Date.parse(
        user.metadata.lastSignInTime || user.metadata.creationTime
      );
      if (olderThan(lastSignIn, RETENTION_DAYS.inactiveAccounts)) {
        inactiveUids.push(user.uid);
      }
    }
    pageToken = page.pageToken;
  } while (pageToken);
} catch (e) {
  // The service account may lack the Firebase Authentication Admin role
  authError = e.code || e.message;
}

for (const uid of inactiveUids) {
  update[`users/${uid}`] = null;
  update[`publicProfiles/${uid}`] = null;
  update[`userMatches/${uid}`] = null;

  for (const entry of Object.values(userMatches[uid] ?? {})) {
    const isHost = entry.hostId === uid;
    const opponentId = isHost ? entry.guestId : entry.hostId;
    const field = isHost ? 'hostName' : 'guestName';
    const opponentEntry = `userMatches/${opponentId}/${entry.matchId}`;

    // Unless the match itself is being deleted
    if (opponentId && update[opponentEntry] !== null) {
      update[`${opponentEntry}/${field}`] = REMOVED_PLAYER_NAME;
    }
  }
  counts.inactiveAccounts++;
}

// A multi-path update refuses a path inside another one it also writes: drop
// the ones already covered by a deleted ancestor.
for (const path of Object.keys(update)) {
  const parts = path.split('/');
  for (let i = 1; i < parts.length; i++) {
    if (update[parts.slice(0, i).join('/')] === null) {
      delete update[path];
      break;
    }
  }
}

console.log(apply ? 'Applying retention:' : 'Dry run, nothing deleted:');
console.table(counts);
if (authError) console.log(`Inactive accounts skipped: ${authError}`);

if (apply) {
  if (Object.keys(update).length) await db.ref().update(update);
  for (const uid of inactiveUids) await getAuth().deleteUser(uid);
  console.log(`Done: ${Object.keys(update).length} paths updated.`);
}

// Everything else was applied, but fail the job so the skipped accounts are
// noticed
process.exit(authError ? 1 : 0);
