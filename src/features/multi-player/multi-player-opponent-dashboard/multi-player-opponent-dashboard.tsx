import './multi-player-opponent-dashboard.scss';
import { useMemo } from 'react';
import clsx from 'clsx';
import { Card } from 'src/components';
import { MultiPlayerOpponentDashboardWithMatch } from './_multi-player-opponent-dashboard-with-match';
import { MultiPlayerOpponentDashboardInvitation } from './_multi-player-opponent-dashboard-invitation';
import { useMultiPlayerContext } from 'src/features/multi-player/multi-player-context';

export function MultiPlayerOpponentDashboard() {
  const { match } = useMultiPlayerContext();
  const hasMatch = useMemo(() => match?.guestId && match?.hostId, [match]);

  return (
    <div
      className={clsx('multi-player-guest-dashboard', {
        'multi-player-guest-dashboard--with-match': hasMatch,
      })}
    >
      {hasMatch ? (
        <MultiPlayerOpponentDashboardWithMatch match={match} />
      ) : (
        <Card>
          <MultiPlayerOpponentDashboardInvitation />
        </Card>
      )}
    </div>
  );
}
