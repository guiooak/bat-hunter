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

// The public side of a match: enough to accept the invitation, nothing about
// the games or the chat (only the players read matches/$id).
export type InvitationType = {
  hostId: string;
  guestId?: string;
  createdAt: number;
};

export async function createMatchInFirebase({ hostId }: { hostId: string }) {
  const id = generateUuid();
  const createdAt = Date.now();

  await setMatchInFirebase({ id, hostId, createdAt });
  await updateData(`invitations/${id}`, { hostId, createdAt });

  return id;
}

export function getInvitationFromFirebase(matchId: string) {
  return getData<InvitationType>(`invitations/${matchId}`);
}

// Joins as the guest. The match goes first: the rules check the invitation
// and the players' match lists against it.
export async function joinMatchInFirebase(matchId: string, guestId: string) {
  await setMatchInFirebase({ id: matchId, guestId });
  await updateData(`invitations/${matchId}`, { guestId });
}

export function setMatchInFirebase(data: MatchType) {
  return updateData(`matches/${data.id}`, data);
}

// Returns the unsubscribe function. onDenied runs when the user is not one of
// the players: matches are private to them.
export function getMatchDataReactivelyFromFirebase(
  id: string,
  cb: (match: MatchType | undefined) => void,
  onDenied?: () => void
) {
  return getReactively<MatchType | null>(
    `matches/${id}`,
    (match) => cb(match ?? undefined),
    onDenied
  );
}
