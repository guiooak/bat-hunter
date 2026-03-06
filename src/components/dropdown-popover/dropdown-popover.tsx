import { ReactNode } from 'react';
import './dropdown-popover.scss';

interface DropdownPopoverProps {
  trigger: ReactNode;
  children: ReactNode;
}

export function DropdownPopover({ trigger, children }: DropdownPopoverProps) {
  return (
    <div className="dropdown-popover">
      <div className="dropdown-popover__trigger">{trigger}</div>
      <div className="dropdown-popover__content">{children}</div>
    </div>
  );
}
