import { ReactNode } from 'react';
import clsx from 'clsx';
import { useI18n } from 'src/i18n';
import './score-chip.scss';

// Compact player score, shown instead of the score cards on phones.
export function ScoreChip({
  name,
  status,
  killCounter,
  finalScore,
  accuracy,
  className,
}: {
  name?: string;
  status?: ReactNode;
  killCounter: number;
  finalScore: number;
  accuracy: number;
  className?: string;
}) {
  const { t } = useI18n();

  return (
    <div className={clsx('bh-score-chip', className)}>
      <div className="bh-score-chip__head">
        <span className="bh-score-chip__name">{name}</span>
        {status}
      </div>
      <div className="bh-score-chip__kills">{killCounter}</div>
      <div className="bh-score-chip__meta">
        {finalScore} {t.game.points} · {accuracy}%
      </div>
    </div>
  );
}
