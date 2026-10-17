import { Button, Gutter, Input, Title } from '@components';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Gap } from 'src/components/gap';
import { createMatchInFirebase } from 'src/models/match-model';
import { useAuthContext } from 'src/features/authentication';
import { SignInModal } from 'src/features/sign-in-modal';

export function MultiPlayerOpponentDashboardInvitation() {
  const navigate = useNavigate();
  const { matchId } = useParams<{ matchId?: string }>();
  const { currentUser } = useAuthContext();
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
      <div className="multi-player-guest-dashboard-invitation">
        <Gutter size="md">
          <Title>Match Setup</Title>

          <Gutter size="xl">
            <div>
              {matchId ? (
                <Gap vertical justify="center" align="center" size="md">
                  <div>Share the invitation link.</div>
                  <UrlCopyButton invitationUrl={buildInvitationUrl(matchId)} />
                </Gap>
              ) : (
                <Gap justify="center">
                  <Button kind="primary" onClick={onCreateGame}>
                    Create a Game
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
        {copied ? 'Copied!' : 'Copy invite link'}
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
