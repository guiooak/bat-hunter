import clsx from 'clsx';
import { SegmentedControl } from 'src/components';
import {
  BAT_TYPE_NAMES,
  BAT_TYPES,
  BatType,
  Difficulty,
} from 'src/services/bat-types';
import { FLYING_BAT_IMG } from 'src/services/fly-engine-service';
import { useI18n } from 'src/i18n';
import './difficulty-picker.scss';

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
  const { t } = useI18n();

  return (
    <div className="difficulty-picker">
      <SegmentedControl
        label={t.difficulty.label}
        options={[
          { value: 'easy', label: t.difficulty.easy },
          { value: 'hard', label: t.difficulty.hard },
        ]}
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
  const { t } = useI18n();

  return (
    <ul className="difficulty-picker__legend" aria-label={t.difficulty.legend}>
      {BAT_TYPE_NAMES.map((type) => (
        <li key={type} title={t.batTypes[type]}>
          <BatIcon type={type} name={t.batTypes[type]} />
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

function BatIcon({ type, name }: { type: BatType; name: string }) {
  return (
    <img
      alt={name}
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
