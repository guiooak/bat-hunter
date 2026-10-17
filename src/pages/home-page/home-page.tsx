import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { Button } from 'src/components';
import { disableBatGame, killAllBats } from 'src/services/game-service';
import './home-page.scss';
import clsx from 'clsx';

export function HomePage() {
  const [showBg, setShowBg] = useState(false);

  useEffect(() => {
    disableBatGame();
    killAllBats();
    setTimeout(() => setShowBg(true), 100);
  }, []);

  return (
    <div className="home-page">
      <img
        className={clsx('home-page-bg', { visible: showBg })}
        src="/images/sniper-aim-bg.jpg"
        alt=""
      />
      <div className="home-page__box">
        <p className="home-page__tagline">Too many bats, time to drop some.</p>
        <div className="home-page__actions">
          <NavLink to="/single-player">
            <Button kind="secondary">Play Single</Button>
          </NavLink>
          <NavLink to="/multi-player">
            <Button kind="secondary">Play Multi</Button>
          </NavLink>
        </div>
      </div>
    </div>
  );
}
