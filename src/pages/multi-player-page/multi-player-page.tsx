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
import {
  MultiPlayerContextProvider,
  useMultiPlayerContext,
} from 'src/features/multi-player/multi-player-context';
import { useNavigate, useParams } from 'react-router';
import { Pulse } from 'src/features/authentication/pulse';

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
      <Pulse />
      <MultiPlayerContextProvider>
        <SignInModal
          open={signInModalOpen}
          onClose={() => setSignInModalOpen(false)}
        />
        <PrivateMatchRedirect />
        <MultiPlayerMainDashboard />
        <MultiPlayerOpponentDashboard />
        <MultiPlayerGameDashboard />
        <MultiPlayerChat />
        <MusicToggle />
      </MultiPlayerContextProvider>
    </div>
  );
}

// Someone who is not one of the players cannot read the match: the invitation
// page tells them whether they can still join or the match is private.
function PrivateMatchRedirect() {
  const { isMatchPrivate } = useMultiPlayerContext();
  const { matchId } = useParams<{ matchId?: string }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (isMatchPrivate && matchId) {
      navigate(`/invitation-link/${matchId}`, { replace: true });
    }
  }, [isMatchPrivate, matchId, navigate]);

  return null;
}
