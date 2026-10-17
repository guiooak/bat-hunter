import './multi-player-chat.scss';
import { useAuthContext } from 'src/features/authentication';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Text } from 'src/components';
import clsx from 'clsx';
import { TextArea } from 'src/components/text-area/text-area';
import { Gap } from 'src/components/gap';
import { createMessageInFirebase } from 'src/models/message-model';
import { buildArray } from 'src/services/array-service';
import { useMultiPlayerContext } from 'src/features/multi-player/multi-player-context';

export function MultiPlayerChat() {
  const { match, opponentUser } = useMultiPlayerContext();
  const { currentUser } = useAuthContext();
  const chatScrollContainerRef = useRef<HTMLElement | null>(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [readMessagesCounter, setReadMessagesCounter] = useState(0);
  const [currentMessage, setCurrentMessage] = useState<string | undefined>();
  const [sendError, setSendError] = useState<string | null>(null);

  const messagesArray = useMemo(
    () => buildArray(match?.messages),
    [match?.messages]
  );
  const unreadMessagesCounter = messagesArray.length - readMessagesCounter;

  useEffect(() => {
    scrollTopBottom(chatScrollContainerRef.current);

    if (chatOpen) {
      setReadMessagesCounter(messagesArray.length);
    }
  }, [chatOpen, messagesArray.length]);

  const canChat = Boolean(match?.id && currentUser?.id);

  function saveMessage() {
    const message = currentMessage?.trim();

    if (!match?.id || !currentUser?.id || !message || isSubmitting) return;

    setIsSubmitting(true);
    setSendError(null);
    createMessageInFirebase({
      matchId: match.id,
      authorId: currentUser.id,
      message,
    })
      .then(() => {
        setCurrentMessage('');
        scrollTopBottom(chatScrollContainerRef.current);
      })
      .catch((e) => {
        console.error('MultiPlayerChat::Error: Message could not be saved', e);
        setSendError('Message not sent. Press Enter to try again.');
      })
      .finally(() => setIsSubmitting(false));
  }

  return (
    <div
      className={clsx('multi-player-chat', {
        'multi-player-chat--open': chatOpen,
      })}
    >
      <header onClick={() => setChatOpen(!chatOpen)}>
        <Gap justify="space-between" align="center">
          <div>
            Chat {!!unreadMessagesCounter && `(${unreadMessagesCounter})`}
          </div>
          <div>
            {!!unreadMessagesCounter && (
              <span
                className="multi-player-chat__unread"
                aria-label="Unread messages"
              />
            )}
          </div>
        </Gap>
      </header>
      <section
        className={clsx('multi-player-chat__collapse', { open: chatOpen })}
      >
        <main
          ref={chatScrollContainerRef}
          className="multi-player-chat__container"
        >
          <div className="multi-player-chat__scroll-cotainer">
            <Gap vertical size="md">
              {messagesArray.map((message) => {
                const isSelf = message?.authorId === currentUser?.id;
                const name = isSelf ? currentUser?.name : opponentUser?.name;

                return (
                  <ChatMessage
                    self={isSelf}
                    key={message.id}
                    authorName={name?.split(' ')[0]}
                    text={message?.message || ''}
                    timestamp={message?.createdAt || 0}
                  />
                );
              })}
            </Gap>
          </div>
        </main>
        <footer>
          <TextArea
            placeholder={
              canChat
                ? 'Enter to send, Shift+Enter for a new line'
                : 'Create or join a match to chat'
            }
            className="chat-input"
            name="chat-input"
            disabled={!canChat}
            value={currentMessage ?? ''}
            onChange={setCurrentMessage}
            onReturn={saveMessage}
          />
          {sendError && (
            <Text block size="xs" className="multi-player-chat__error">
              {sendError}
            </Text>
          )}
        </footer>
      </section>
    </div>
  );
}

function scrollTopBottom(container: HTMLElement | null) {
  if (container) {
    container.scrollTop = container?.scrollHeight;
  }
}

function ChatMessage({
  text,
  authorName,
  timestamp,
  self,
}: {
  text: string;
  timestamp: number;
  authorName?: string;
  self?: boolean;
}) {
  const datetime = new Date(timestamp);
  const fullDatetimeHumanized = datetime.toLocaleString();
  const timeHumanized = fullDatetimeHumanized.split(', ')[1];
  const name = self ? 'You' : authorName;
  const align = self ? 'right' : 'left';

  return (
    <div className="chat-message">
      <Text block size="sm" align={align}>
        {text}
      </Text>
      <Text secondary size="xxs" align={align}>
        {name}, <span title={fullDatetimeHumanized}>{timeHumanized}</span>
      </Text>
    </div>
  );
}
