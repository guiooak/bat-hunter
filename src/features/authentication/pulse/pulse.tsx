import { useEffect } from 'react';
import { useAuthContext } from 'src/features/authentication/auth-context';

const DELAY_IN_MS = 20 * 1000;

// Publishes presence (online/away) for the opponent. Mounted only on the
// multiplayer pages: outside a match nobody needs to know.
export function Pulse() {
  const { status, updatePresence } = useAuthContext();
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (!isAuthenticated) return;

    let lastPulseAt = Date.now();
    updatePresence({ away: false, lastPulseAt });

    const onPulse = () => {
      const now = Date.now();

      if (now > lastPulseAt + DELAY_IN_MS) {
        lastPulseAt = now;
        updatePresence({ lastPulseAt: now, away: false });
      }
    };
    const onBlur = () => updatePresence({ away: true });
    const onFocus = () => {
      lastPulseAt = Date.now();
      updatePresence({ away: false, lastPulseAt });
    };

    window.addEventListener('mouseover', onPulse);
    window.addEventListener('pointerdown', onPulse);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);

    return () => {
      updatePresence({ away: true });
      window.removeEventListener('mouseover', onPulse);
      window.removeEventListener('pointerdown', onPulse);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [isAuthenticated, updatePresence]);

  return null;
}
