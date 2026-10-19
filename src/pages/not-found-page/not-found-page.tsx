import { useCallback, useEffect, useState } from 'react';
import { NavLink } from 'react-router';
import { Button } from 'src/components';
import {
  disableAimOnly,
  enableAimOnly,
  killAllBats,
} from 'src/services/game-service';
import { createBat } from 'src/services/fly-engine-service';
import { BatType, pickBatType } from 'src/services/bat-types';
import { iterate } from 'src/services/iteration-service';
import symbolUrl from '../../../brand/logo/symbol.svg';
import './not-found-page.scss';

const FLOCK_SIZE = 8;

// The page is gone, but the bats are not: shoot them while you are lost.
export function NotFoundPage() {
  const [kills, setKills] = useState(0);
  const [shotTheOwl, setShotTheOwl] = useState(false);

  const releaseBats = useCallback(
    () =>
      iterate(FLOCK_SIZE, () =>
        createBat({
          type: pickBatType('hard'),
          withPoints: true,
          onHit: (type: BatType) => {
            if (type === 'owl') setShotTheOwl(true);
            else setKills((count) => count + 1);
          },
        })
      ),
    []
  );

  useEffect(() => {
    enableAimOnly();
    releaseBats();

    return () => {
      killAllBats();
      disableAimOnly();
    };
  }, [releaseBats]);

  return (
    <div className="not-found-page">
      <div className="not-found-page__box">
        <div className="not-found-page__code" role="img" aria-label="404">
          <span>4</span>
          <img src={symbolUrl} alt="" draggable={false} />
          <span>4</span>
        </div>
        <h1 className="not-found-page__title">
          This page flew off into the night.
        </h1>
        <p className="not-found-page__text">
          We searched every belfry and every attic. Something with wings took
          it.
        </p>
        <p className="not-found-page__score" aria-live="polite">
          {buildScoreMessage(kills, shotTheOwl)}
        </p>
        <div className="not-found-page__actions">
          <NavLink to="/">
            <Button kind="primary">Take me home</Button>
          </NavLink>
          <Button kind="secondary" onClick={releaseBats}>
            Release more bats
          </Button>
        </div>
      </div>
    </div>
  );
}

function buildScoreMessage(kills: number, shotTheOwl: boolean) {
  if (shotTheOwl) {
    return 'You shot the owl. It was the only one who knew the way back. 🦉';
  }

  if (kills === 0) return 'While you are here, why not drop a bat or two?';
  if (kills === 1) return '1 bat dropped. Still no page, though.';
  if (kills < 10) return `${kills} bats dropped. The page is still missing.`;
  if (kills < 25) return `${kills} bats! Are you even looking for that page?`;

  return `${kills} bats. Forget the page, you found your calling.`;
}
