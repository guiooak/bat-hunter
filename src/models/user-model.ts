import { UserSessionType } from 'src/services/auth-service';
import {
  getData,
  getReactively,
  updateData,
} from 'src/services/firebase-service';

// Private to the user (users/$uid): only the owner reads it.
export type PrivateUserType = {
  id: string;
  firstName: string;
  picture: string;
};

// What other players see (publicProfiles/$uid): first name, photo, presence.
export type PublicProfileType = {
  firstName?: string;
  picture?: string;
  away?: boolean;
  lastPulseAt?: number;
};

export type PresenceType = Pick<PublicProfileType, 'away' | 'lastPulseAt'>;

export function setPrivateUserInFirebase(data: PrivateUserType) {
  return updateData('users/' + data.id, data);
}

// The language the player picked, kept in the private node so it follows them
// to any browser. Returns null when they never picked one.
export function getPrivateUserLanguage(id: string) {
  return getData<string>(`users/${id}/language`);
}

export function setPrivateUserLanguage(id: string, language: string) {
  return updateData('users/' + id, { language });
}

export function setPublicProfileInFirebase(
  id: string,
  data: PublicProfileType
) {
  return updateData('publicProfiles/' + id, data);
}

export function getPublicProfileFromFirebase(id: string) {
  return getData<PublicProfileType>('publicProfiles/' + id);
}

// Returns the unsubscribe function. The profile comes as a session-like user,
// with the first name as the name: that is all other players get to see.
export function getPublicProfileReactivelyFromFirebase(
  id: string,
  cb: (user: UserSessionType | null) => void
) {
  return getReactively<PublicProfileType | null>(
    'publicProfiles/' + id,
    (profile) =>
      cb(
        profile && {
          ...profile,
          id,
          name: profile.firstName,
        }
      )
  );
}

// -- User Matches (userMatches/$uid, readable by the owner only) --

export type UserMatchType = {
  matchId: string;
  hostId: string;
  hostName: string;
  guestId: string;
  guestName: string;
  createdAt: number;
};

export function setUserMatchInFirebase(userId: string, match: UserMatchType) {
  return updateData(`userMatches/${userId}/${match.matchId}`, match);
}

export async function getUserMatchesFromFirebase(
  userId: string
): Promise<UserMatchType[]> {
  const data = await getData<Record<string, UserMatchType>>(
    `userMatches/${userId}`
  );

  return data ? Object.values(data) : [];
}
