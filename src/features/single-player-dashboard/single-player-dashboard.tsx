import { useEffect, useReducer, useState } from 'react';
import './single-player-dashboard.scss';
import {
  getIsGameModeOn,
  setBodyOnClick,
  calcAccuracy,
  killAllBats,
} from 'src/services/game-service';
import { createBat } from '@services/fly-engine-service';
import { SinglePlayerDashboardChallenge } from './_single-player-dashboard-challenge';
import { Card, Divider, Gutter } from '@components';
import { SinglePlayerDashboardScore } from 'src/features/single-player-dashboard/_single-player-dashboard-score';
import { SinglePlayerDashboardActions } from 'src/features/single-player-dashboard/_single-player-dashboard-actions';
import { isShotEnabled, ShotEventType } from '@services/shot-service';
import { iterate } from 'src/services/iteration-service';
import { SINGLE_PLAYER_CHALLENGE_STATES } from './_single-player-constants';

function counterReducer(state: number, action: string) {
  return action === 'add' ? state + 1 : 0;
}

export function SinglePlayerDashboard() {
  const [isScoreEnabled, setIsScoreEnabled] = useState(true);
  const [killCounter, dispatchKillCounter] = useReducer(counterReducer, 0);
  const [shotCounter, dispatchShotCounter] = useReducer(counterReducer, 0);
  const currentGameStateFull = useState(
    SINGLE_PLAYER_CHALLENGE_STATES.FREE_PLAY
  );
  const [currentGameState] = currentGameStateFull;

  const createControlledBat = () =>
    createBat(() => isScoreEnabled && dispatchKillCounter('add'));

  useEffect(() => {
    setBodyOnClick((e: ShotEventType) => {
      if (isScoreEnabled && getIsGameModeOn() && isShotEnabled(e)) {
        dispatchShotCounter('add');
      }
    });
  }, [isScoreEnabled]);

  useEffect(
    () => console.log('kills x shots: ', `${killCounter} x ${shotCounter}`),
    [shotCounter, killCounter]
  );

  function cleanScore() {
    dispatchKillCounter('reset');
    dispatchShotCounter('reset');
  }

  return (
    <div className="single-player-dashboard">
      <Card>
        <Gutter size="md">
          <SinglePlayerDashboardScore
            killCounter={killCounter}
            accuracy={calcAccuracy(shotCounter, killCounter)}
            resetDisabled={currentGameState !== 'FREE_PLAY'}
            sendBatDisabled={['CHALLENGE_READY', 'CHALLENGE_FINISHED'].includes(
              currentGameState
            )}
            onCreateBat={() => iterate(10, createControlledBat)}
            onResetScore={cleanScore}
          />
        </Gutter>
        <Divider />
        <Gutter size="md">
          <SinglePlayerDashboardChallenge
            currentGameStateFull={currentGameStateFull}
            setIsScoreEnabled={setIsScoreEnabled}
            onResetScore={cleanScore}
            onCreateBat={createControlledBat}
          />
        </Gutter>

        <Divider />
        <Gutter size="md">
          <SinglePlayerDashboardActions
            buttonsDisabled={currentGameState === 'CHALLENGE_IN_PROGRESS'}
            onCleanBats={killAllBats}
          />
        </Gutter>
      </Card>
    </div>
  );
}
