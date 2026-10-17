import { ReactNode, useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import './dropdown-popover.scss';

interface DropdownPopoverProps {
  trigger: ReactNode;
  children: ReactNode;
}

// Opens on hover where there is one, and on tap or click everywhere.
export function DropdownPopover({ trigger, children }: DropdownPopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function closeOnOutside(e: PointerEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }

    document.addEventListener('pointerdown', closeOnOutside);
    return () => document.removeEventListener('pointerdown', closeOnOutside);
  }, [open]);

  return (
    <div
      ref={rootRef}
      className={clsx('dropdown-popover', { 'dropdown-popover--open': open })}
    >
      <div
        className="dropdown-popover__trigger"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setOpen(!open);
          }
        }}
      >
        {trigger}
      </div>
      <div className="dropdown-popover__content" onClick={() => setOpen(false)}>
        {children}
      </div>
    </div>
  );
}
