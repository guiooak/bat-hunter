import { useEffect } from 'react';
import { SinglePlayerDashboard } from 'src/features/single-player-dashboard';
import { MusicToggle } from 'src/features/music-toggle';
import { enableBatGame } from 'src/services/game-service';
import './single-player-page.scss';

export function SinglePlayerPage() {
  useEffect(() => {
    enableBatGame();
  }, []);

  return (
    <div className="single-player-page">
      <SinglePlayerDashboard />
      <MusicToggle />
    </div>
  );
}
