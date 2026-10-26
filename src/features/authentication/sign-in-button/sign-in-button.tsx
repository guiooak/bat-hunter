import './sign-in-button.scss';
import { useEffect, useState } from 'react';
import { Button, Text } from 'src/components';
import { disableBatGame, killAllBats } from 'src/services/game-service';
import { useAuthContext } from 'src/features/authentication';
import { NavLink } from 'react-router';
import { MIN_MULTIPLAYER_AGE } from 'src/services/legal-service';
import { useI18n } from 'src/i18n';

export function SignInButton({ onSuccess }: { onSuccess?: () => void }) {
  const { signIn } = useAuthContext();
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    disableBatGame();
    killAllBats();
  }, []);

  async function onSignIn() {
    setError(null);
    setBusy(true);

    try {
      await signIn();
      onSuccess?.();
    } catch (e) {
      console.error('Google Sign In Error', e);
      setError(t.signIn.error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sign-in-button">
      <Button kind="primary" onClick={onSignIn} disabled={busy}>
        {busy ? t.signIn.busy : t.signIn.button}
      </Button>
      {error && (
        <Text block size="sm">
          {error}
        </Text>
      )}
      {/* Transparency, not consent: the legal basis is the game itself */}
      <p className="sign-in-button__notice">
        {t.signIn.noticeStart}
        <NavLink to="/terms">{t.signIn.noticeTerms}</NavLink>
        {t.signIn.noticeMiddle(MIN_MULTIPLAYER_AGE)}
        <NavLink to="/privacy">{t.signIn.noticePrivacy}</NavLink>
        {t.signIn.noticeEnd}
      </p>
    </div>
  );
}
