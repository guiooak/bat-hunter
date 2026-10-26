import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useAuthContext } from 'src/features/authentication';
import { disableBatGame, killAllBats } from 'src/services/game-service';
import { useI18n } from 'src/i18n';

export function LogoutPage() {
  const navigate = useNavigate();
  const { signOut } = useAuthContext();
  const { t } = useI18n();

  useEffect(() => {
    disableBatGame();
    killAllBats();
    signOut().finally(() => navigate('/', { replace: true }));
  }, [navigate, signOut]);

  return <div className="logout-page">{t.common.loading}</div>;
}
