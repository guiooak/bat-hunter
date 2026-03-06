import {
  getCurrentUserSession,
  UserSessionType,
} from 'src/services/authentication-service';
import {
  getData,
  getReactively,
  updateData,
} from 'src/services/firebase-service';

function getCurrentUserId() {
  return getCurrentUserSession()?.id;
}

export function getCurrentUserDataFromFirebase() {
  const currentUserId = getCurrentUserId();

  return currentUserId ? getUserDataFromFirebase(currentUserId) : null;
}

export function setCurrentUserDataInFirebase(data: UserSessionType) {
  const currentUserId = getCurrentUserId();

  if (currentUserId) {
    setUserDataInFirebase({
      ...data,
      id: currentUserId,
    });
  }
}

export function getUserDataFromFirebase(id: string) {
  return getData('users/' + id) as Promise<UserSessionType | null>;
}

export async function setUserDataInFirebase(
  data: UserSessionType & { id: string }
) {
  if (!data?.id) {
    console.error('setUserDataInFirebase::ERROR: no user id was provided');
    return;
  }

  updateData('users/' + data.id, data);
}

export function getUserDataReactivelyFromFirebase(
  id: string,
  cb: (userData: UserSessionType) => void
) {
  getReactively('users/' + id, cb);
}

// -- User Matches --

export type UserMatchType = {
  matchId: string;
  hostId: string;
  hostName: string;
  guestId: string;
  guestName: string;
  createdAt: number;
};

export function setUserMatchInFirebase(userId: string, match: UserMatchType) {
  if (!userId || !match?.matchId) {
    console.error('setUserMatchInFirebase::ERROR: missing userId or matchId');
    return;
  }

  updateData(`users/${userId}/matches/${match.matchId}`, match);
}

export async function getUserMatchesFromFirebase(
  userId: string
): Promise<UserMatchType[]> {
  const data = await getData<Record<string, UserMatchType>>(
    `users/${userId}/matches`
  );

  if (!data) return [];

  return Object.values(data);
}
