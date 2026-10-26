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
import { Messages, useI18n } from 'src/i18n';
import symbolUrl from '../../../brand/logo/symbol.svg';
import './not-found-page.scss';

const FLOCK_SIZE = 8;

// The page is gone, but the bats are not: shoot them while you are lost.
export function NotFoundPage() {
  const { t } = useI18n();
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
        <h1 className="not-found-page__title">{t.notFound.title}</h1>
        <p className="not-found-page__text">{t.notFound.text}</p>
        <p className="not-found-page__score" aria-live="polite">
          {buildScoreMessage(t.notFound, kills, shotTheOwl)}
        </p>
        <div className="not-found-page__actions">
          <NavLink to="/">
            <Button kind="primary">{t.notFound.takeMeHome}</Button>
          </NavLink>
          <Button kind="secondary" onClick={releaseBats}>
            {t.notFound.releaseMore}
          </Button>
        </div>
      </div>
    </div>
  );
}

function buildScoreMessage(
  texts: Messages['notFound'],
  kills: number,
  shotTheOwl: boolean
) {
  if (shotTheOwl) return texts.shotTheOwl;
  if (kills === 0) return texts.noKills;
  if (kills === 1) return texts.oneKill;
  if (kills < 10) return texts.fewKills(kills);
  if (kills < 25) return texts.manyKills(kills);

  return texts.lotsOfKills(kills);
}
