import { setData } from 'src/services/firebase-service';
import { v7 as generateUuid } from 'uuid';

export type MessageType = {
  id?: string;
  createdAt?: number;
  authorId?: string;
  message?: string;
};

export async function createMessageInFirebase({
  matchId,
  authorId,
  message,
}: {
  matchId: string;
  authorId: string;
  message: string;
}) {
  const id = generateUuid();
  const data = {
    id,
    createdAt: Date.now(),
    authorId,
    message,
  };

  await setData(`matches/${matchId}/messages/${id}`, data);

  return id;
}
