import { Gap } from '../gap';
import { Gutter } from '../gutter';
import { Text } from '../text';
import { Title } from '../title';

// A player's kills, final score and accuracy: the single-player panel and
// both multiplayer score cards.
export function ScoreSummary({
  title,
  titleSize,
  killCounter,
  finalScore,
  accuracy,
}: {
  title: string;
  titleSize?: 'h2' | 'h4';
  killCounter: number;
  finalScore: number;
  accuracy: number;
}) {
  return (
    <section className="bat-game-score-section">
      <Title size={titleSize}>{title}</Title>
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
    </section>
  );
}
