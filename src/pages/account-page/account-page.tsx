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
import { useI18n } from 'src/i18n';
import './account-page.scss';

type Summary = Awaited<ReturnType<typeof getAccountSummary>>;

// The player's data, theirs to see, take and erase (LGPD art. 18).
export function AccountPage() {
  const navigate = useNavigate();
  const { currentUser, status } = useAuthContext();
  const { t } = useI18n();
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
      setError(t.account.downloadError);
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
      setError(t.account.deleteError(PRIVACY_CONTACT));
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
        <Title size="h1">{t.account.title}</Title>
        <p className="account-page__intro">
          {t.account.introStart}
          <NavLink to="/privacy">{t.account.introLink}</NavLink>
          {t.account.introEnd}
        </p>

        <section className="account-page__card">
          <h2>{t.account.keepTitle}</h2>
          <div className="account-page__profile">
            <Avatar src={currentUser?.picture} />
            <div>
              <div className="account-page__name">{currentUser?.firstName}</div>
              <div className="account-page__muted">
                {t.account.accountId} {currentUser?.id}
              </div>
            </div>
          </div>
          <ul>
            <li>{t.account.keepProfile}</li>
            <li>
              {t.account.keepMatches(
                summary ? summary.matches : '…',
                summary ? summary.messages : '…'
              )}
            </li>
            <li>{t.account.keepLanguage}</li>
            <li>{t.account.keepPresence}</li>
            <li>{t.account.keepEmail}</li>
            <li>
              {t.account.keepBrowser(
                summary && Object.keys(summary.preferences).length
                  ? Object.keys(summary.preferences)
                      .map(
                        (key) =>
                          t.account.preferenceNames[
                            key as keyof typeof t.account.preferenceNames
                          ]
                      )
                      .join(', ')
                  : t.account.noPreferences
              )}
            </li>
          </ul>
        </section>

        <section className="account-page__card">
          <h2>{t.account.downloadTitle}</h2>
          <p>{t.account.downloadText}</p>
          <Button kind="secondary" onClick={onExport} disabled={isExporting}>
            {isExporting ? t.account.downloadBusy : t.account.download}
          </Button>
        </section>

        <section className="account-page__card account-page__card--danger">
          <h2>{t.account.deleteTitle}</h2>
          <p>{t.account.deleteText}</p>
          {confirmingDelete ? (
            <>
              <p className="account-page__warning">{t.account.deleteWarning}</p>
              <ButtonGroup>
                <Button
                  kind="tertiary"
                  onClick={() => setConfirmingDelete(false)}
                  disabled={isDeleting}
                >
                  {t.account.keepAccount}
                </Button>
                <Button kind="primary" onClick={onDelete} disabled={isDeleting}>
                  {isDeleting ? t.account.deleteBusy : t.account.deleteConfirm}
                </Button>
              </ButtonGroup>
            </>
          ) : (
            <Button kind="secondary" onClick={() => setConfirmingDelete(true)}>
              {t.account.deleteButton}
            </Button>
          )}
        </section>

        {error && <p className="account-page__error">{error}</p>}

        <p className="account-page__muted">
          {t.account.contact(PRIVACY_CONTACT)}
        </p>
      </div>
    </div>
  );
}
