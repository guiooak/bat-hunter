import './sign-in-button.scss';
import { useEffect, useState } from 'react';
import { Button, Text } from '@components';
import { disableBatGame, killAllBats } from 'src/services/game-service';
import { useAuthContext } from 'src/features/authentication';

export function SignInButton({ onSuccess }: { onSuccess?: () => void }) {
  const { signIn } = useAuthContext();
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
      setError('Ops! Something wrong happened. Try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="sign-in-button">
      <Button kind="primary" onClick={onSignIn} disabled={busy}>
        {busy ? 'Signing in…' : 'Continue with Google'}
      </Button>
      {error && (
        <Text block size="sm">
          {error}
        </Text>
      )}
    </div>
  );
}
