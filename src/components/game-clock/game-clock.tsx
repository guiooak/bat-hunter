import clsx from 'clsx';
import { Text } from 'src/components/text';
import './game-clock.scss';

// Shows the countdown while a challenge runs, otherwise the game state label.
export function GameClock({
  countdownTime,
  label = '',
}: {
  countdownTime: number;
  label?: string;
}) {
  const isRunning = countdownTime > 0;

  return (
    <Text
      size="xl"
      className={clsx('bh-game-clock', {
        'bh-game-clock--danger': isRunning && countdownTime <= 10,
      })}
    >
      {isRunning ? `${countdownTime}s` : label}
    </Text>
  );
}
