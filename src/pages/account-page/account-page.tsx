import { useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router';
import { Avatar, Button, ButtonGroup, Title } from 'src/components';
import { useAuthContext } from 'src/features/authentication';
import { SignInModal } from 'src/features/sign-in-modal';
import {
  buildAccountExport,
  deleteAccount,
  getAccountSummary,
} from 'src/services/account-service';
import { reauthenticateCurrentUser } from 'src/services/auth-service';
import { disableBatGame, killAllBats } from 'src/services/game-service';
import { PRIVACY_CONTACT } from 'src/services/legal-service';
import './account-page.scss';

type Summary = Awaited<ReturnType<typeof getAccountSummary>>;

// The player's data, theirs to see, take and erase (LGPD art. 18).
export function AccountPage() {
  const navigate = useNavigate();
  const { currentUser, status } = useAuthContext();
  const userId = currentUser?.id;
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    disableBatGame();
    killAllBats();
  }, []);

  useEffect(() => {
    if (!userId) return;

    getAccountSummary(userId)
      .then(setSummary)
      .catch((e) => console.error('AccountPage::ERROR: summary', e));
  }, [userId]);

  async function onExport() {
    if (!userId) return;

    setError(null);
    setIsExporting(true);

    try {
      const data = await buildAccountExport(userId);
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const link = document.createElement('a');

      link.href = URL.createObjectURL(blob);
      link.download = 'bat-hunter-my-data.json';
      link.click();
      URL.revokeObjectURL(link.href);
    } catch (e) {
      console.error('AccountPage::ERROR: export', e);
      setError('The download failed. Try again in a moment.');
    } finally {
      setIsExporting(false);
    }
  }

  async function onDelete() {
    if (!userId) return;

    setError(null);
    setIsDeleting(true);

    try {
      // First, so the popup opens right from the click and nothing is erased
      // if the player closes it
      await reauthenticateCurrentUser();
      await deleteAccount(userId);
      navigate('/', { replace: true });
    } catch (e) {
      console.error('AccountPage::ERROR: delete', e);
      setError(
        `The account was not deleted. Try again, or write to ${PRIVACY_CONTACT}.`
      );
      setIsDeleting(false);
    }
  }

  if (status !== 'authenticated') {
    return (
      <div className="account-page">
        <SignInModal
          open={status === 'unauthenticated'}
          onClose={() => navigate('/')}
        />
      </div>
    );
  }

  return (
    <div className="account-page">
      <div className="account-page__container">
        <Title size="h1">My data</Title>
        <p className="account-page__intro">
          What Bat Hunter keeps about you, a copy to take with you, and the way
          out. Details in the <NavLink to="/privacy">Privacy Policy</NavLink>.
        </p>

        <section className="account-page__card">
          <h2>What we keep</h2>
          <div className="account-page__profile">
            <Avatar src={currentUser?.picture} />
            <div>
              <div className="account-page__name">{currentUser?.firstName}</div>
              <div className="account-page__muted">
                Account ID {currentUser?.id}
              </div>
            </div>
          </div>
          <ul>
            <li>
              Your first name and photo, from Google. To correct them, change
              them in your Google account and sign in again.
            </li>
            <li>
              {summary ? summary.matches : '…'} matches with their scores, and{' '}
              {summary ? summary.messages : '…'} chat messages you sent.
            </li>
            <li>
              Your presence (online or away), only while you play multiplayer.
            </li>
            <li>
              Your email, kept by Google's sign-in service (Firebase
              Authentication). The game never reads it.
            </li>
            <li>
              In this browser only:{' '}
              {summary && Object.keys(summary.preferences).length
                ? Object.keys(summary.preferences)
                    .map((key) => key.replace('bh-', '').replace(/-/g, ' '))
                    .join(', ')
                : 'no saved preferences'}
              .
            </li>
          </ul>
        </section>

        <section className="account-page__card">
          <h2>Download a copy</h2>
          <p>
            A JSON file with your account, your matches (your own scores) and
            your messages.
          </p>
          <Button kind="secondary" onClick={onExport} disabled={isExporting}>
            {isExporting ? 'Preparing…' : 'Download my data'}
          </Button>
        </section>

        <section className="account-page__card account-page__card--danger">
          <h2>Delete my account</h2>
          <p>
            Erases your profile, your match list, your chat messages and your
            sign-in. Your opponents keep their own scores, and you show up as a
            removed player. This cannot be undone.
          </p>
          {confirmingDelete ? (
            <>
              <p className="account-page__warning">
                Google will ask you to confirm it is you. Then everything is
                erased.
              </p>
              <ButtonGroup>
                <Button
                  kind="tertiary"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={isDeleting}
                >
                  Keep my account
                </Button>
                <Button kind="primary" onClick={onDelete} disabled={isDeleting}>
                  {isDeleting ? 'Deleting…' : 'Yes, delete everything'}
                </Button>
              </ButtonGroup>
            </>
          ) : (
            <Button kind="secondary" onClick={() => setConfirmingDelete(true)}>
              Delete my account
            </Button>
          )}
        </section>

        {error && <p className="account-page__error">{error}</p>}

        <p className="account-page__muted">
          Anything else about your data: {PRIVACY_CONTACT}.
        </p>
      </div>
    </div>
  );
}
