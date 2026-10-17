import { Button, ButtonGroup, Gutter, Text, Title } from '@components';

type Props = {
  killCounter: number;
  accuracy: number;
  resetDisabled: boolean;
  sendBatDisabled: boolean;
  onCreateBat: () => void;
  onResetScore: () => void;
};

export function SinglePlayerDashboardScore({
  killCounter = 0,
  accuracy = 100,
  resetDisabled = false,
  sendBatDisabled = false,
  onCreateBat = () => {},
  onResetScore = () => {},
}: Props) {
  const finalScore = killCounter * accuracy;

  return (
    <section className="bat-game-score-section">
      <div>
        <Title>Your Score</Title>
        <div className="text-center">
          <Gutter size="lg">
            <Text size="xxl">{killCounter}</Text>
          </Gutter>
        </div>
        <div className="text-center">Final Score: {finalScore}</div>
        <br />
      </div>
      <ButtonGroup flex>
        <div>
          <div>Accuracy</div>
          <div className="text-center">{accuracy}%</div>
        </div>
        <Button kind="tertiary" disabled={resetDisabled} onClick={onResetScore}>
          Reset
        </Button>
        <Button kind="primary" disabled={sendBatDisabled} onClick={onCreateBat}>
          Send Bats
        </Button>
      </ButtonGroup>
    </section>
  );
}
