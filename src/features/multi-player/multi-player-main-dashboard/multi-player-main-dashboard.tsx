import './multi-player-main-dashboard.scss';
import { calcAccuracy, calcFinalScore } from 'src/services/game-service';
import { Card, Divider, Gutter, ScoreChip, ScoreSummary } from 'src/components';
import { useAuthContext } from 'src/features/authentication';
import { ProfileSection } from 'src/components/profile-section';
import { useGameCounters } from 'src/hooks/game-hooks';
import { useMultiPlayerContext } from 'src/features/multi-player/multi-player-context';
import { useI18n } from 'src/i18n';

export function MultiPlayerMainDashboard() {
  const { currentUser } = useAuthContext();
  const { t } = useI18n();
  const { match } = useMultiPlayerContext();

  const { shotCounter, killCounter, points } = useGameCounters({
    match,
    playerKind: 'main',
  });

  const accuracy = calcAccuracy(shotCounter, killCounter);
  const finalScore = calcFinalScore(shotCounter, killCounter, points);

  return (
    <div className="multi-player-main-dashboard">
      <Card>
        <Gutter size="md">
          <ScoreSummary
            title={t.game.score}
            titleSize="h4"
            killCounter={killCounter}
            accuracy={accuracy}
            finalScore={finalScore}
          />
        </Gutter>
        <Divider />
        <Gutter size="md">
          <ProfileSection image={currentUser?.picture} name={t.multi.you} />
        </Gutter>
      </Card>
      <ScoreChip
        name={t.multi.you}
        killCounter={killCounter}
        finalScore={finalScore}
        accuracy={accuracy}
      />
    </div>
  );
}
