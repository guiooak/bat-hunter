import { useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { Button } from 'src/components';
import { disableBatGame, killAllBats } from 'src/services/game-service';
import './home-page.scss';
import clsx from 'clsx';
import { useI18n } from 'src/i18n';

export function HomePage() {
  const { t } = useI18n();
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
        <p className="home-page__tagline">{t.home.tagline}</p>
        <div className="home-page__actions">
          <NavLink to="/single-player">
            <Button kind="secondary">{t.home.playSingle}</Button>
          </NavLink>
          <NavLink to="/multi-player">
            <Button kind="secondary">{t.home.playMulti}</Button>
          </NavLink>
        </div>
      </div>
      <footer className="home-page__legal">
        <NavLink to="/privacy">{t.home.privacy}</NavLink>
        <NavLink to="/terms">{t.home.terms}</NavLink>
        <NavLink to="/settings">{t.home.settings}</NavLink>
      </footer>
    </div>
  );
}
