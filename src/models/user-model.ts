import { UserSessionType } from 'src/services/auth-service';
import {
  getData,
  getReactively,
  updateData,
} from 'src/services/firebase-service';

export function getUserDataFromFirebase(id: string) {
  return getData<UserSessionType>('users/' + id);
}

export function setUserDataInFirebase(data: UserSessionType & { id: string }) {
  return updateData('users/' + data.id, data);
}

// Returns the unsubscribe function.
export function getUserDataReactivelyFromFirebase(
  id: string,
  cb: (userData: UserSessionType | null) => void
) {
  return getReactively('users/' + id, cb);
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
  return updateData(`users/${userId}/matches/${match.matchId}`, match);
}

export async function getUserMatchesFromFirebase(
  userId: string
): Promise<UserMatchType[]> {
  const data = await getData<Record<string, UserMatchType>>(
    `users/${userId}/matches`
  );

  return data ? Object.values(data) : [];
}
