import { PropsWithChildren, useEffect } from 'react';
import clsx from 'clsx';
import './modal.scss';

export function Modal({
  className,
  children,
  header,
  footer,
  open,
  onClose,
  preventOverlayClosing,
}: PropsWithChildren<{
  open: boolean;
  onClose?: () => void;
  className?: string;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  preventOverlayClosing?: boolean;
}>) {
  // Set the keyup event listener to close modal only while it's open
  useEffect(() => {
    if (!open) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose?.();
    };

    window.addEventListener('keyup', handleEscape);

    return () => {
      window.removeEventListener('keyup', handleEscape);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <div className={clsx(className, 'bh-modal')}>
      <div
        className="bh-modal__overlay"
        onClick={() => !preventOverlayClosing && onClose?.()}
      ></div>
      <div className="bh-modal__container">
        <button className="bh-modal__close-button" onClick={onClose}>
          &#x2715;
        </button>
        {header && <header>{header}</header>}
        <main>{children}</main>
        {footer && <footer>{footer}</footer>}
      </div>
    </div>
  );
}
