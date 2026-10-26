import { KeyboardEvent, useId, useRef } from 'react';
import clsx from 'clsx';
import './segmented-control.scss';

type Option<T extends string> = {
  value: T;
  label: string;
  // Accessible name when the label is an abbreviation (EN, PT)
  ariaLabel?: string;
};

// One choice out of a few, shown as a single track. A setting, not an action:
// it stays smaller and quieter than the buttons around it.
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  readOnly = false,
  note,
  size = 'md',
  hideLabel = false,
}: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange?: (value: T) => void;
  // Shows only the current choice, with no affordance to change it
  readOnly?: boolean;
  // Short text beside a read-only choice, e.g. who picks it
  note?: string;
  // Small, for a toolbar (the navbar)
  size?: 'sm' | 'md';
  // Still read by screen readers
  hideLabel?: boolean;
}) {
  const labelId = useId();
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const current = options.find((option) => option.value === value);

  function select(index: number) {
    const option = options[index];
    onChange?.(option.value);
    optionRefs.current[index]?.focus();
  }

  // Arrows move the choice, like native radio buttons
  function onKeyDown(e: KeyboardEvent, index: number) {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[
      e.key
    ];
    if (!step) return;

    e.preventDefault();
    select((index + step + options.length) % options.length);
  }

  return (
    <div className={clsx('bh-segmented', `bh-segmented--${size}`)}>
      <div
        className={clsx('bh-segmented__label', {
          'bh-segmented__label--hidden': hideLabel,
        })}
        id={labelId}
      >
        {label}
      </div>
      {readOnly ? (
        <div className="bh-segmented__readonly" aria-labelledby={labelId}>
          <span className="bh-segmented__value">{current?.label}</span>
          {note && <span className="bh-segmented__note">{note}</span>}
        </div>
      ) : (
        <div
          className="bh-segmented__track"
          role="radiogroup"
          aria-labelledby={labelId}
        >
          {options.map((option, index) => {
            const checked = option.value === value;

            return (
              <button
                key={option.value}
                ref={(el) => {
                  optionRefs.current[index] = el;
                }}
                type="button"
                role="radio"
                aria-checked={checked}
                aria-label={option.ariaLabel}
                tabIndex={checked ? 0 : -1}
                className={clsx('bh-segmented__option', {
                  'bh-segmented__option--checked': checked,
                })}
                onClick={() => !checked && onChange?.(option.value)}
                onKeyDown={(e) => onKeyDown(e, index)}
              >
                {option.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
