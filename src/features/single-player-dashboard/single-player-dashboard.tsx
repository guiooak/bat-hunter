import { useReducer, useState } from 'react';
import './single-player-dashboard.scss';
import {
  calcAccuracy,
  counterReducer,
  killAllBats,
} from 'src/services/game-service';
import { SinglePlayerDashboardChallenge } from './_single-player-dashboard-challenge';
import { Divider, GamePanel, GamePanelStat, Gutter } from '@components';
import { SinglePlayerDashboardScore } from 'src/features/single-player-dashboard/_single-player-dashboard-score';
import { SinglePlayerDashboardActions } from 'src/features/single-player-dashboard/_single-player-dashboard-actions';
import { useGameCounterTriggers } from 'src/hooks/game-hooks';
import { iterate } from 'src/services/iteration-service';
import { SINGLE_PLAYER_CHALLENGE_STATES } from './_single-player-constants';

export function SinglePlayerDashboard() {
  const [killCounter, dispatchKillCounter] = useReducer(counterReducer, 0);
  const [shotCounter, dispatchShotCounter] = useReducer(counterReducer, 0);
  const currentGameStateFull = useState(
    SINGLE_PLAYER_CHALLENGE_STATES.FREE_PLAY
  );
  const [currentGameState] = currentGameStateFull;

  const { createControlledBat, setIsScoreEnabled } = useGameCounterTriggers({
    onShot: () => dispatchShotCounter('add'),
    onKill: () => dispatchKillCounter('add'),
  });

  const accuracy = calcAccuracy(shotCounter, killCounter);

  function cleanScore() {
    dispatchKillCounter('reset');
    dispatchShotCounter('reset');
  }

  return (
    <div className="single-player-dashboard">
      <GamePanel
        summary={
          <>
            <GamePanelStat label="Kills" value={killCounter} />
            <GamePanelStat label="Score" value={killCounter * accuracy} />
            <GamePanelStat label="Accuracy" value={`${accuracy}%`} />
          </>
        }
      >
        <Gutter size="md">
          <SinglePlayerDashboardScore
            killCounter={killCounter}
            accuracy={accuracy}
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
      </GamePanel>
    </div>
  );
}
