import { useEffect } from 'react';
import { useAuthContext } from '../auth-context';

const DELAY_IN_SECONDS = 20 * 1000;

// It's fine since there is only a single instance of this component in the whole application.
// Using useState was registering multiple event listeners as a side effect.
let lastPulseAt = 0;

export function Pulse() {
  const { setCurrentUser } = useAuthContext();

  useEffect(() => {
    onPulse(() => {
      const now = Date.now();

      if (now > lastPulseAt + DELAY_IN_SECONDS) {
        lastPulseAt = now;
        setCurrentUser({ lastPulseAt: now, away: false });
      }
    });
    onBlur(() => setCurrentUser({ away: true }));
    onFocus(() => setCurrentUser({ away: false, lastPulseAt: Date.now() }));
  }, [setCurrentUser]);

  return <></>;
}

function onPulse(cb: () => void) {
  window.addEventListener('mouseover', cb);
  window.addEventListener('click', cb);
}

function onBlur(cb: () => void) {
  window.addEventListener('blur', cb);
}

function onFocus(cb: () => void) {
  window.addEventListener('focus', cb);
}
