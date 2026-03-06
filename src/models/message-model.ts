import { setData } from 'src/services/firebase-service';
import { v7 as generateUuid } from 'uuid';

export type MessageType = {
  id?: string;
  createdAt?: number;
  authorId?: string;
  readerId?: string;
  message?: string;
};

export async function createMessageInFirebase({
  matchId,
  authorId,
  message,
  onCreated,
}: {
  matchId?: string;
  authorId?: string;
  message?: string;
  onCreated?: (gameId: string) => void;
  onError?: (error: string) => void;
}) {
  if (!matchId || !authorId || !message) {
    console.error('createMessageInFirebase::ERROR: missing required paramters');
    return;
  }

  const id = generateUuid();
  const data = {
    id,
    createdAt: Date.now(),
    authorId,
    message,
  };

  try {
    setData(`matches/${matchId}/messages/${data.id}`, data);
    onCreated?.(id);
  } catch {
    console.error(
      'createMessageInFirebase::ERROR: it was not possible to store the new message. Try again later.'
    );
  }

  return id;
}
