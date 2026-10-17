import clsx from 'clsx';
import { KeyboardEvent } from 'react';
import './text-area.scss';

export function TextArea({
  placeholder,
  className,
  value,
  name,
  readOnly,
  disabled,
  onChange,
  onReturn,
}: {
  placeholder?: string;
  className?: string;
  value?: string;
  name: string;
  readOnly?: boolean;
  disabled?: boolean;
  onChange?: (v?: string) => void;
  onReturn?: () => void;
}) {
  // Enter submits; Shift+Enter (or Enter while composing an accent) types a new line
  function onKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (!onReturn || e.key !== 'Enter' || e.shiftKey) return;
    if (e.nativeEvent.isComposing) return;

    e.preventDefault();
    onReturn();
  }

  return (
    <textarea
      className={clsx('bh-text-area', className)}
      placeholder={placeholder}
      readOnly={readOnly}
      disabled={disabled}
      value={value}
      name={name}
      id={name}
      onKeyDown={onKeyDown}
      onChange={(e) => onChange?.(e.target.value)}
    />
  );
}
