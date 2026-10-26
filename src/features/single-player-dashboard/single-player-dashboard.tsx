import { useReducer, useState } from 'react';
import './single-player-dashboard.scss';
import {
  calcAccuracy,
  calcFinalScore,
  counterReducer,
  killAllBats,
  pointsReducer,
  scoreHit,
} from 'src/services/game-service';
import { Difficulty, isDifficulty } from 'src/services/bat-types';
import {
  getLocalStorageValue,
  setLocalStorageValue,
} from 'src/services/local-storage-service';
import { SinglePlayerDashboardChallenge } from './_single-player-dashboard-challenge';
import { Divider, GamePanel, GamePanelStat, Gutter } from 'src/components';
import { SinglePlayerDashboardScore } from 'src/features/single-player-dashboard/_single-player-dashboard-score';
import { SinglePlayerDashboardActions } from 'src/features/single-player-dashboard/_single-player-dashboard-actions';
import { useGameCounterTriggers } from 'src/hooks/game-hooks';
import { iterate } from 'src/services/iteration-service';
import { SINGLE_PLAYER_CHALLENGE_STATES } from './_single-player-constants';

export function SinglePlayerDashboard() {
  const [killCounter, dispatchKillCounter] = useReducer(counterReducer, 0);
  const [shotCounter, dispatchShotCounter] = useReducer(counterReducer, 0);
  const [points, dispatchPoints] = useReducer(pointsReducer, 0);
  const [difficulty, setDifficulty] = useState<Difficulty>(() => {
    const saved = getLocalStorageValue('bh-difficulty');
    return isDifficulty(saved) ? saved : 'easy';
  });
  const currentGameStateFull = useState(
    SINGLE_PLAYER_CHALLENGE_STATES.FREE_PLAY
  );
  const [currentGameState] = currentGameStateFull;

  const { createControlledBat, setIsScoreEnabled } = useGameCounterTriggers({
    onShot: () => dispatchShotCounter('add'),
    onHit: (type) =>
      scoreHit(type, {
        addKill: () => dispatchKillCounter('add'),
        addPoints: dispatchPoints,
      }),
    difficulty,
  });

  const accuracy = calcAccuracy(shotCounter, killCounter);
  const finalScore = calcFinalScore(shotCounter, killCounter, points);

  function cleanScore() {
    dispatchKillCounter('reset');
    dispatchShotCounter('reset');
    dispatchPoints('reset');
  }

  function changeDifficulty(value: Difficulty) {
    setDifficulty(value);
    setLocalStorageValue('bh-difficulty', value);
  }

  return (
    <div className="single-player-dashboard">
      <GamePanel
        summary={
          <>
            <GamePanelStat label="Kills" value={killCounter} />
            <GamePanelStat label="Score" value={finalScore} />
            <GamePanelStat label="Accuracy" value={`${accuracy}%`} />
          </>
        }
      >
        <Gutter size="md">
          <SinglePlayerDashboardScore
            killCounter={killCounter}
            finalScore={finalScore}
            accuracy={accuracy}
            resetDisabled={currentGameState !== 'FREE_PLAY'}
            sendBatHidden={currentGameState === 'CHALLENGE_IN_PROGRESS'}
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
            difficulty={difficulty}
            onDifficultyChange={changeDifficulty}
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
