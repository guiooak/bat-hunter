import { Gutter, Text, Title } from '@components';
import { Gap } from 'src/components/gap';

export function MultiPlayerOpponentDashboardScore({
  opponentName,
  killCounter = 0,
  accuracy = 100,
  finalScore = 0,
}: {
  opponentName?: string;
  killCounter?: number;
  accuracy?: number;
  finalScore?: number;
}) {
  return (
    <section className="bat-game-score-section">
      <div>
        {opponentName ? (
          <Title size="h4">Score</Title>
        ) : (
          <Title size="h4">Loading...</Title>
        )}
        <div className="text-center">
          <Gutter size="lg">
            <Text size="xxl">{killCounter}</Text>
          </Gutter>
        </div>
      </div>

      <Gap justify="space-around">
        <div>
          <div>Accuracy</div>
          <div className="text-center">{accuracy}%</div>
        </div>
        <div>
          <div>Final Score</div>
          <div className="text-center">{finalScore}</div>
        </div>
      </Gap>
    </section>
  );
}
