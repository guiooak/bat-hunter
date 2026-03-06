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
      />
      <div className="box">
        <div className="text">Too many bats, time to drop some.</div>
        <br />
        <NavLink to="/single-player">
          <Button kind="primary">Play Single</Button>
        </NavLink>
        <span style={{ marginLeft: 16 }} />
        <NavLink to="/multi-player">
          <Button kind="primary">Play Multi</Button>
        </NavLink>
      </div>
    </div>
  );
}
