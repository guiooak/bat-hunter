import {
  getData,
  getReactively,
  updateData,
} from 'src/services/firebase-service';
import { v7 as generateUuid } from 'uuid';
import { GameType } from './game-model';
import { MessageType } from './message-model';

export type MatchType = {
  id: string;
  hostId?: string;
  guestId?: string;
  createdAt?: number;
  games?: Record<string, GameType>;
  messages?: Record<string, MessageType>;
};

export function getMatchInFirebase(id: string) {
  return getData<MatchType>(`matches/${id}`);
}

export async function createMatchInFirebase({ hostId }: { hostId: string }) {
  const id = generateUuid();

  await setMatchInFirebase({ id, hostId, createdAt: Date.now() });

  return id;
}

export function setMatchInFirebase(data: MatchType) {
  return updateData(`matches/${data.id}`, data);
}

// Returns the unsubscribe function.
export function getMatchDataReactivelyFromFirebase(
  id: string,
  cb: (match: MatchType | undefined) => void
) {
  return getReactively<MatchType | null>(`matches/${id}`, (match) =>
    cb(match ?? undefined)
  );
}
