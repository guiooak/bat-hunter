import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthContext } from 'src/features/authentication';
import { disableBatGame, killAllBats } from 'src/services/game-service';

export function LogoutPage() {
  const navigate = useNavigate();
  const { signOut } = useAuthContext();

  useEffect(() => {
    disableBatGame();
    killAllBats();
    signOut().finally(() => navigate('/', { replace: true }));
  }, [navigate, signOut]);

  return <div className="logout-page">Loading...</div>;
}
