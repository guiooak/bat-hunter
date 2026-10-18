import clsx from 'clsx';
import { SegmentedControl } from '@components';
import {
  BAT_TYPE_NAMES,
  BAT_TYPES,
  BatType,
  Difficulty,
} from 'src/services/bat-types';
import { FLYING_BAT_IMG } from 'src/services/fly-engine-service';
import './difficulty-picker.scss';

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: 'Easy' },
  { value: 'hard', label: 'Hard' },
];

export function DifficultyPicker({
  value,
  onChange,
  readOnly = false,
  note,
}: {
  value: Difficulty;
  onChange?: (value: Difficulty) => void;
  readOnly?: boolean;
  note?: string;
}) {
  return (
    <div className="difficulty-picker">
      <SegmentedControl
        label="Difficulty"
        options={DIFFICULTIES}
        value={value}
        onChange={onChange}
        readOnly={readOnly}
        note={note}
      />
      {value === 'hard' && <BatLegend />}
    </div>
  );
}

function BatLegend() {
  return (
    <ul className="difficulty-picker__legend" aria-label="Hard mode targets">
      {BAT_TYPE_NAMES.map((type) => (
        <li key={type} title={BAT_TYPES[type].label}>
          <BatIcon type={type} />
          <span
            className={clsx({
              'difficulty-picker__negative': BAT_TYPES[type].points < 0,
            })}
          >
            {formatPoints(BAT_TYPES[type].points)}
          </span>
        </li>
      ))}
    </ul>
  );
}

function BatIcon({ type }: { type: BatType }) {
  return (
    <img
      alt={BAT_TYPES[type].label}
      src={type === 'owl' ? '/images/owl.svg' : FLYING_BAT_IMG}
      className={clsx(
        'difficulty-picker__icon',
        `difficulty-picker__icon--${type}`
      )}
    />
  );
}

function formatPoints(points: number) {
  return points > 0 ? `+${points}` : `−${Math.abs(points)}`;
}
