// The rights of the players over their data (LGPD art. 18): see it, take it
// with them (export) and erase it (account deletion).
import { MatchType } from 'src/models/match-model';
import {
  getUserMatchesFromFirebase,
  PublicProfileType,
  setUserMatchInFirebase,
  UserMatchType,
} from 'src/models/user-model';
import {
  deleteCurrentAuthUser,
  getAuthAccountInfo,
} from 'src/services/auth-service';
import { getData, removeData } from 'src/services/firebase-service';
import { calcFinalScore } from 'src/services/game-service';
import { CONTROLLER_NAME, PRIVACY_CONTACT } from 'src/services/legal-service';

const LOCAL_PREFERENCE_KEYS = ['bh-background-music-muted', 'bh-difficulty'];
export const REMOVED_PLAYER_NAME = 'Removed player';

type MatchWithEntry = { entry: UserMatchType; match: MatchType | null };

async function getMyMatches(userId: string): Promise<MatchWithEntry[]> {
  const entries = await getUserMatchesFromFirebase(userId);

  return Promise.all(
    entries.map(async (entry) => ({
      entry,
      // The player still reads the match; it may be gone after retention
      match: await getData<MatchType>(`matches/${entry.matchId}`).catch(
        () => null
      ),
    }))
  );
}

function myMessages(match: MatchType | null, userId: string) {
  return Object.values(match?.messages ?? {}).filter(
    (message) => message.authorId === userId
  );
}

export async function getAccountSummary(userId: string) {
  const matches = await getMyMatches(userId);

  return {
    matches: matches.length,
    messages: matches.reduce(
      (sum, { match }) => sum + myMessages(match, userId).length,
      0
    ),
    preferences: readLocalPreferences(),
  };
}

function readLocalPreferences() {
  return Object.fromEntries(
    LOCAL_PREFERENCE_KEYS.flatMap((key) => {
      try {
        const value = localStorage.getItem(key);
        return value === null ? [] : [[key, JSON.parse(value)]];
      } catch {
        return [];
      }
    })
  );
}

// Everything the game keeps about the player, and only theirs: the opponent
// appears by first name, without their scores or messages.
export async function buildAccountExport(userId: string) {
  const [account, publicProfile, matches] = await Promise.all([
    getData(`users/${userId}`),
    getData<PublicProfileType>(`publicProfiles/${userId}`),
    getMyMatches(userId),
  ]);

  return {
    exportedAt: new Date().toISOString(),
    controller: { name: CONTROLLER_NAME, contact: PRIVACY_CONTACT },
    account,
    signIn: getAuthAccountInfo(),
    publicProfile,
    matches: matches.map(({ entry, match }) => {
      const isHost = entry.hostId === userId;

      return {
        matchId: entry.matchId,
        createdAt: new Date(entry.createdAt).toISOString(),
        role: isHost ? 'host' : 'guest',
        opponent: isHost ? entry.guestName : entry.hostName,
        games: Object.values(match?.games ?? {}).map((game) => {
          const mine = isHost ? game.hostData : game.guestData;

          return {
            id: game.id,
            createdAt: game.createdAt && new Date(game.createdAt).toISOString(),
            state: game.state,
            difficulty: game.difficulty ?? 'easy',
            shots: mine?.shotCounter ?? 0,
            kills: mine?.killCounter ?? 0,
            points: mine?.points ?? mine?.killCounter ?? 0,
            finalScore: calcFinalScore(
              mine?.shotCounter,
              mine?.killCounter,
              mine?.points
            ),
            result: !game.winnerId
              ? null
              : game.winnerId === 'DRAW'
                ? 'draw'
                : game.winnerId === userId
                  ? 'win'
                  : 'loss',
          };
        }),
        messages: myMessages(match, userId).map((message) => ({
          id: message.id,
          sentAt: new Date(message.createdAt || 0).toISOString(),
          text: message.message,
        })),
      };
    }),
    browserPreferences: readLocalPreferences(),
  };
}

// Erases the player's data. The caller must have confirmed the sign-in just
// before (reauthenticateCurrentUser), or Firebase refuses the last step.
//
// In past matches the opponent keeps their own score; the player's ID stays
// there with no name, photo or account behind it, and their messages go.
export async function deleteAccount(userId: string) {
  const matches = await getMyMatches(userId);

  for (const { entry, match } of matches) {
    await Promise.all(
      myMessages(match, userId).map((message) =>
        removeData(`matches/${entry.matchId}/messages/${message.id}`)
      )
    );

    const isHost = entry.hostId === userId;
    const opponentId = isHost ? entry.guestId : entry.hostId;

    if (opponentId && match) {
      await setUserMatchInFirebase(opponentId, {
        ...entry,
        ...(isHost
          ? { hostName: REMOVED_PLAYER_NAME }
          : { guestName: REMOVED_PLAYER_NAME }),
      }).catch((e) =>
        console.error('deleteAccount: opponent list not updated', e)
      );
    }
  }

  await removeData(`userMatches/${userId}`);
  await removeData(`publicProfiles/${userId}`);
  await removeData(`users/${userId}`);

  LOCAL_PREFERENCE_KEYS.forEach((key) => {
    try {
      localStorage.removeItem(key);
    } catch {
      // Storage may be blocked; nothing to clean then
    }
  });

  await deleteCurrentAuthUser();
}
