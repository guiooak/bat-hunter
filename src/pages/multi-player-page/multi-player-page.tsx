import { useEffect, useState } from 'react';
import { MultiPlayerMainDashboard } from 'src/features/multi-player/multi-player-main-dashboard';
import { MultiPlayerOpponentDashboard } from 'src/features/multi-player/multi-player-opponent-dashboard';
import { MusicToggle } from 'src/features/music-toggle';
import { enableBatGame } from 'src/services/game-service';
import './multi-player-page.scss';
import { useAuthContext } from 'src/features/authentication';
import { MultiPlayerGameDashboard } from 'src/features/multi-player/multi-player-game-dashboard';
import { MultiPlayerChat } from 'src/features/multi-player/multi-player-chat';
import { SignInModal } from 'src/features/sign-in-modal/sign-in-modal';
import { MultiPlayerContextProvider } from 'src/features/multi-player/multi-player-context';

export function MultiPlayerPage() {
  const { status } = useAuthContext();
  const [signInModalOpen, setSignInModalOpen] = useState(false);

  useEffect(() => {
    setSignInModalOpen(status === 'unauthenticated');
  }, [status]);

  useEffect(() => {
    enableBatGame();
  }, []);

  return (
    <div className="multi-player-page">
      <MultiPlayerContextProvider>
        <SignInModal
          open={signInModalOpen}
          onClose={() => setSignInModalOpen(false)}
        />
        <MultiPlayerMainDashboard />
        <MultiPlayerOpponentDashboard />
        <MultiPlayerGameDashboard />
        <MultiPlayerChat />
        <MusicToggle />
      </MultiPlayerContextProvider>
    </div>
  );
}
