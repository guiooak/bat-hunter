import { updateData } from 'src/services/firebase-service';
import { v7 as generateUuid } from 'uuid';

type PlayerDataType = {
  shotCounter: number;
  killCounter: number;
  updatedAt?: number;
};

export type GameStateType =
  | 'GAME_READY'
  | 'GAME_IN_PROGRESS'
  | 'GAME_FINISHED'
  | 'GAME_CLOSED';

export const CHALLENGE_STATES = {
  FREE_PLAY: 'FREE_PLAY',
  CHALLENGE_READY: 'CHALLENGE_READY',
  CHALLENGE_IN_PROGRESS: 'CHALLENGE_IN_PROGRESS',
  CHALLENGE_FINISHED: 'CHALLENGE_FINISHED',
} as const;

export type ChallengeStateType =
  (typeof CHALLENGE_STATES)[keyof typeof CHALLENGE_STATES];

export type GameType = {
  id?: string;
  createdAt?: number;
  updatedAt?: number;
  state?: GameStateType;
  winnerId?: string;
  guestData?: PlayerDataType;
  hostData?: PlayerDataType;
};

export function createGameInFirebase({
  matchId,
  onCreated,
  onError = () => {},
}: {
  matchId?: string;
  onCreated?: (gameId: string) => void;
  onError?: (error: string) => void;
}) {
  if (!matchId) {
    console.error('setGameInFirebase::ERROR: no user id was provided');
    return;
  }

  const id = generateUuid();
  const data = {
    id,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    state: 'GAME_READY' as const,
  };

  setGameInFirebase({ matchId, data })
    .then((r) => {
      console.log('GAME_CREATED_IN_FIREBASE', r);
      onCreated?.(id);
    })
    .catch(onError);

  return id;
}

export async function setGameInFirebase({
  matchId,
  data,
}: {
  matchId: string;
  data: GameType;
}) {
  if (!data?.id) {
    console.error('setGameInFirebase::ERROR: no game id was provided');
    return;
  }

  const _data = { ...data, updatedAt: Date.now() };

  updateData(`matches/${matchId}/games/${data.id}`, _data);
}

export async function setPlayerDataInFirebase({
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
  if (!matchId || !gameId) {
    console.error('setPlayerDataInFirebase::ERROR: no user id was provided');
    return;
  }

  const _data = { ...data, updatedAt: Date.now() };

  updateData(`matches/${matchId}/games/${gameId}/${player}Data`, _data);
}

export function setGameWinner(
  matchId?: string,
  gameId?: string,
  winnerId?: string
) {
  if (!matchId || !gameId || !winnerId) return;

  setGameInFirebase({
    matchId: matchId,
    data: { id: gameId, winnerId },
  });
}

export function setGameState(
  matchId?: string,
  gameId?: string,
  state?: GameStateType
) {
  if (!matchId || !gameId || !state) return;

  setGameInFirebase({
    matchId: matchId,
    data: { id: gameId, state },
  });
}

// {
//   id
//   createdAt
//   hostId
//   guestId
//   games {
//     id
//     createdAt
//     state
//     winnerId
//     guestData {
//       shotCounter
//       killCounter
//     }
//     hostData {
//       shotCounter
//       killCounter
//     }
//   }
// }
