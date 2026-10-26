import { Button, Gutter, Input, Title } from 'src/components';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Gap } from 'src/components/gap';
import { createMatchInFirebase } from 'src/models/match-model';
import { useAuthContext } from 'src/features/authentication';
import { SignInModal } from 'src/features/sign-in-modal';
import { useI18n } from 'src/i18n';

export function MultiPlayerOpponentDashboardInvitation() {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId?: string }>();
  const { currentUser } = useAuthContext();
  const { t } = useI18n();
  const [signInModalOpen, setSignInModalOpen] = useState(false);

  async function onCreateGame() {
    if (!currentUser?.id) {
      setSignInModalOpen(true);
      return;
    }

    try {
      const newMatchId = await createMatchInFirebase({
        hostId: currentUser.id,
      });
      navigate(`/multi-player/${newMatchId}`);
    } catch (e) {
      console.error('ERROR: could not create the match.', e);
    }
  }

  return (
    <>
      <SignInModal
        open={signInModalOpen}
        onClose={() => setSignInModalOpen(false)}
      />
      <div className="multi-player-opponent-dashboard-invitation">
        <Gutter size="md">
          <Title>{t.multi.matchSetup}</Title>

          <Gutter size="lg" direction="vertical">
            <div>
              {matchId ? (
                <Gap
                  vertical
                  justify="center"
                  align="stretch"
                  size="md"
                  className="text-center"
                >
                  <div>{t.multi.shareInvite}</div>
                  <UrlCopyButton invitationUrl={buildInvitationUrl(matchId)} />
                </Gap>
              ) : (
                <Gap justify="center">
                  <Button kind="primary" onClick={onCreateGame}>
                    {t.multi.createGame}
                  </Button>
                </Gap>
              )}
            </div>
          </Gutter>
        </Gutter>
      </div>
    </>
  );
}

function UrlCopyButton({ invitationUrl }: { invitationUrl: string }) {
  const { t } = useI18n();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (copied) {
      setTimeout(() => {
        setCopied(false);
      }, 3000);
    }
  }, [copied]);

  function _onCopy() {
    setCopied(true);
    copyStringToClipboard(invitationUrl);
  }

  return (
    <>
      <Input value={invitationUrl} name="match-url" readOnly />
      <Button kind="primary" onClick={_onCopy}>
        {copied ? t.multi.copied : t.multi.copyInvite}
      </Button>
    </>
  );
}

function buildInvitationUrl(matchId: string) {
  return `${origin}/invitation-link/${matchId}`;
}

function copyStringToClipboard(value: string) {
  navigator.clipboard.writeText(value);
}
