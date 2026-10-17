import { calcAccuracy, calcFinalScore } from 'src/services/game-service';
import { Divider, Gutter } from '@components';
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

  const { shotCounter, killCounter } = useGameCounters({
    match: match || undefined,
    playerKind: 'opponent',
  });

  const accuracy = calcAccuracy(shotCounter, killCounter);
  const finalScore = calcFinalScore(shotCounter, killCounter);

  return (
    <div className="multi-player-guest-dashboard-with-match">
      <div className="status-slot">
        <GuestStatus
          lastPulseAt={opponentUser?.lastPulseAt}
          away={opponentUser?.away}
        />
      </div>
      <Gutter size="md">
        <MultiPlayerOpponentDashboardScore
          opponentName={opponentUser?.name?.split(' ')[0]}
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
    </div>
  );
}
