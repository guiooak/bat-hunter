import { Button, ButtonGroup, Gutter, Text, Title } from '@components';
import { Gap } from 'src/components/gap';

type Props = {
  killCounter: number;
  finalScore: number;
  accuracy: number;
  resetDisabled: boolean;
  sendBatDisabled: boolean;
  onCreateBat: () => void;
  onResetScore: () => void;
};

export function SinglePlayerDashboardScore({
  killCounter = 0,
  finalScore = 0,
  accuracy = 100,
  resetDisabled = false,
  sendBatDisabled = false,
  onCreateBat = () => {},
  onResetScore = () => {},
}: Props) {
  return (
    <section className="bat-game-score-section">
      <div>
        <Title>Your Score</Title>
        <div className="text-center">
          <Gutter size="lg">
            <Text size="xxl">{killCounter}</Text>
          </Gutter>
        </div>
        <Gap justify="space-around">
          <div className="text-center">
            <div>Final Score</div>
            <div>{finalScore}</div>
          </div>
          <div className="text-center">
            <div>Accuracy</div>
            <div>{accuracy}%</div>
          </div>
        </Gap>
        <br />
      </div>
      <ButtonGroup flex>
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
