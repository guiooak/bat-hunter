import { Gutter, Modal, Title } from 'src/components';
import { Gap } from 'src/components/gap';
import { useAuthContext } from 'src/features/authentication';
import { MatchType } from 'src/models/match-model';
import { GameType } from 'src/models/game-model';
import { calcFinalScore } from 'src/services/game-service';
import { useMultiPlayerContext } from 'src/features/multi-player/multi-player-context';
import { Messages, useI18n } from 'src/i18n';

export function MultiPlayerGameResultModal({
  open,
  onClose,
  match,
  game,
}: {
  open: boolean;
  onClose: () => void;
  match?: MatchType;
  game?: GameType;
}) {
  const { currentUser } = useAuthContext();
  const { t } = useI18n();
  const { opponentUser } = useMultiPlayerContext();
  const isCurrentUserTheHost = currentUser?.id === match?.hostId;

  const currentUserData = isCurrentUserTheHost
    ? game?.hostData
    : game?.guestData;
  const opponentData = isCurrentUserTheHost ? game?.guestData : game?.hostData;

  const currentUserFinalScore = calcFinalScore(
    currentUserData?.shotCounter,
    currentUserData?.killCounter,
    currentUserData?.points
  );

  const opponentUserFinalScore = calcFinalScore(
    opponentData?.shotCounter,
    opponentData?.killCounter,
    opponentData?.points
  );

  return (
    <Modal open={open} onClose={onClose} preventOverlayClosing>
      <Gutter size="xxl">
        <Title center size="h1" weight="medium">
          {buildTitleMessage(t.multi, game?.winnerId, currentUser?.id)}
        </Title>
        <Gutter direction="top" size="xl">
          <Gap justify="center">
            <div>
              <div className="text-right">{currentUserFinalScore}</div>
              <div className="text-right">{t.game.yourScore}</div>
            </div>
            <div>x</div>
            <div>
              <div>{opponentUserFinalScore}</div>
              <div>{t.multi.opponentScore(opponentUser?.firstName || '')}</div>
            </div>
          </Gap>
        </Gutter>
      </Gutter>
    </Modal>
  );
}

function buildTitleMessage(
  texts: Messages['multi'],
  winnerId?: string,
  currentUserId?: string
) {
  const isDraw = winnerId === 'DRAW';
  const isCurrentUserTheWinner = currentUserId === winnerId;

  if (isDraw) {
    return texts.sameScore;
  }

  if (isCurrentUserTheWinner) {
    return texts.youWin;
  }

  return texts.youLose;
}
