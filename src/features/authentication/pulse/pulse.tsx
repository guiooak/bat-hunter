import { useEffect } from 'react';
import { useAuthContext } from '../auth-context';

const DELAY_IN_MS = 20 * 1000;

export function Pulse() {
  const { status, updatePresence } = useAuthContext();
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    if (!isAuthenticated) return;

    let lastPulseAt = Date.now();

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
    window.addEventListener('click', onPulse);
    window.addEventListener('blur', onBlur);
    window.addEventListener('focus', onFocus);

    return () => {
      window.removeEventListener('mouseover', onPulse);
      window.removeEventListener('click', onPulse);
      window.removeEventListener('blur', onBlur);
      window.removeEventListener('focus', onFocus);
    };
  }, [isAuthenticated, updatePresence]);

  return null;
}
