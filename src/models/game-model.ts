import { setData, updateData } from 'src/services/firebase-service';
import { v7 as generateUuid } from 'uuid';

type PlayerDataType = {
  shotCounter: number;
  killCounter: number;
  updatedAt?: number;
};

export const GAME_STATES = {
  GAME_READY: 'GAME_READY',
  GAME_IN_PROGRESS: 'GAME_IN_PROGRESS',
  GAME_FINISHED: 'GAME_FINISHED',
  GAME_CLOSED: 'GAME_CLOSED',
} as const;

export type GameStateType = (typeof GAME_STATES)[keyof typeof GAME_STATES];

export type GameType = {
  id?: string;
  createdAt?: number;
  updatedAt?: number;
  state?: GameStateType;
  winnerId?: string;
  guestData?: PlayerDataType;
  hostData?: PlayerDataType;
};

export async function createGameInFirebase(matchId: string) {
  const id = generateUuid();
  const data = {
    id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    state: GAME_STATES.GAME_READY,
  };

  await setData(`matches/${matchId}/games/${id}`, data);

  return id;
}

export function setGameInFirebase({
  matchId,
  data,
}: {
  matchId: string;
  data: GameType & { id: string };
}) {
  return updateData(`matches/${matchId}/games/${data.id}`, {
    ...data,
    updatedAt: Date.now(),
  });
}

export function setPlayerDataInFirebase({
  matchId,
  gameId,
  player,
  data,
}: {
  matchId: string;
  gameId: string;
  player: 'host' | 'guest';
  data: PlayerDataType;
}) {
  return updateData(`matches/${matchId}/games/${gameId}/${player}Data`, {
    ...data,
    updatedAt: Date.now(),
  });
}

export function setGameWinner(
  matchId?: string,
  gameId?: string,
  winnerId?: string
) {
  if (!matchId || !gameId || !winnerId) return;

  return setGameInFirebase({ matchId, data: { id: gameId, winnerId } });
}

export function setGameState(
  matchId?: string,
  gameId?: string,
  state?: GameStateType
) {
  if (!matchId || !gameId || !state) return;

  return setGameInFirebase({ matchId, data: { id: gameId, state } });
}
