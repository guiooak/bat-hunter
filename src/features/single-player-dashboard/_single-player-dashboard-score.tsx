import { Button, ButtonGroup, ScoreSummary } from '@components';

type Props = {
  killCounter: number;
  finalScore: number;
  accuracy: number;
  resetDisabled: boolean;
  sendBatDisabled: boolean;
  sendBatHidden: boolean;
  onCreateBat: () => void;
  onResetScore: () => void;
};

export function SinglePlayerDashboardScore({
  killCounter,
  finalScore,
  accuracy,
  resetDisabled,
  sendBatDisabled,
  sendBatHidden,
  onCreateBat,
  onResetScore,
}: Props) {
  return (
    <div>
      <ScoreSummary
        title="Your Score"
        killCounter={killCounter}
        finalScore={finalScore}
        accuracy={accuracy}
      />
      <br />
      <ButtonGroup flex>
        <Button kind="tertiary" disabled={resetDisabled} onClick={onResetScore}>
          Reset
        </Button>
        {/* Bats come on their own during a challenge */}
        {!sendBatHidden && (
          <Button
            kind="primary"
            disabled={sendBatDisabled}
            onClick={onCreateBat}
          >
            Send Bats
          </Button>
        )}
      </ButtonGroup>
    </div>
  );
}
