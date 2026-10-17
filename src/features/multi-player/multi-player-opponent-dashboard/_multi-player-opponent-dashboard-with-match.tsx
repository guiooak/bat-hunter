import { calcAccuracy, calcFinalScore } from 'src/services/game-service';
import { Card, Divider, Gutter, ScoreChip } from '@components';
import { MultiPlayerOpponentDashboardScore } from './_multi-player-opponent-dashboard-score';
import { ProfileSection } from '@components/profile-section';
import { GuestStatus } from 'src/components/guest-status';
import { MatchType } from 'src/models/match-model';
import { useGameCounters } from 'src/hooks/game-hooks';
import { useMultiPlayerContext } from '../multi-player-context';

export function MultiPlayerOpponentDashboardWithMatch({
  match,
}: {
  match?: MatchType | null;
}) {
  const { opponentUser } = useMultiPlayerContext();

  const { shotCounter, killCounter, points } = useGameCounters({
    match: match || undefined,
    playerKind: 'opponent',
  });

  const accuracy = calcAccuracy(shotCounter, killCounter);
  const finalScore = calcFinalScore(shotCounter, killCounter, points);
  const firstName = opponentUser?.name?.split(' ')[0];
  const status = (
    <GuestStatus
      lastPulseAt={opponentUser?.lastPulseAt}
      away={opponentUser?.away}
    />
  );

  return (
    <>
      <Card className="multi-player-guest-dashboard-with-match">
        <div className="status-slot">{status}</div>
        <Gutter size="md">
          <MultiPlayerOpponentDashboardScore
            opponentName={firstName}
            killCounter={killCounter}
            accuracy={accuracy}
            finalScore={finalScore}
          />
        </Gutter>
        <Divider />
        <Gutter size="md">
          <ProfileSection
            image={opponentUser?.picture}
            name={opponentUser?.name}
          />
        </Gutter>
      </Card>
      <ScoreChip
        name={firstName}
        status={status}
        killCounter={killCounter}
        finalScore={finalScore}
        accuracy={accuracy}
      />
    </>
  );
}
