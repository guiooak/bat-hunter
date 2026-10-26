import { useState } from 'react';
import { useAuthContext } from 'src/features/authentication';

// The sign-in modal shows by itself to signed-out visitors (until they close
// it) and on demand, e.g. when a signed-out player tries to join a battle.
export function useSignInModal() {
  const { status } = useAuthContext();
  const [isDismissed, setIsDismissed] = useState(false);
  const [isRequested, setIsRequested] = useState(false);

  return {
    open: (status === 'unauthenticated' && !isDismissed) || isRequested,
    request: () => setIsRequested(true),
    close: () => {
      setIsDismissed(true);
      setIsRequested(false);
    },
  };
}
