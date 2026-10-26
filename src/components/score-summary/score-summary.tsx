import { Gap } from 'src/components/gap';
import { Gutter } from 'src/components/gutter';
import { Text } from 'src/components/text';
import { Title } from 'src/components/title';
import { useI18n } from 'src/i18n';

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
  const { t } = useI18n();

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
          <div>{t.game.finalScore}</div>
          <div>{finalScore}</div>
        </div>
        <div className="text-center">
          <div>{t.game.accuracy}</div>
          <div>{accuracy}%</div>
        </div>
      </Gap>
    </section>
  );
}
