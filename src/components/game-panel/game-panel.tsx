import { PropsWithChildren, ReactNode, useState } from 'react';
import clsx from 'clsx';
import { Button } from 'src/components/button';
import { Card } from 'src/components/card';
import './game-panel.scss';

// A Card on desktop. On phones it folds into a bar with the summary, and the
// rest opens on demand so the bats keep the screen.
export function GamePanel({
  summary,
  className,
  children,
}: PropsWithChildren<{ summary: ReactNode; className?: string }>) {
  const [open, setOpen] = useState(false);

  return (
    <Card
      className={clsx('bh-game-panel', className, {
        'bh-game-panel--open': open,
      })}
    >
      <div className="bh-game-panel__bar">
        <div className="bh-game-panel__summary">{summary}</div>
        <Button kind="tertiary" onClick={() => setOpen(!open)}>
          {open ? 'Hide' : 'Controls'}
        </Button>
      </div>
      <div className="bh-game-panel__body">{children}</div>
    </Card>
  );
}

export function GamePanelStat({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="bh-game-panel__stat">
      <span className="bh-game-panel__stat-value">{value}</span>
      <span className="bh-game-panel__stat-label">{label}</span>
    </div>
  );
}
