import { PropsWithChildren } from 'react';
import clsx from 'clsx';
import './gap.scss';

type GapSizeType = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl';

export const Gap = ({
  align = 'start',
  justify = 'normal',
  size = 'sm',
  wrap = false,
  vertical = false,
  className,
  children,
  fullWidth = false,
  fullHeight = false,
}: PropsWithChildren<{
  align?: 'stretch' | 'start' | 'center' | 'end' | 'baseline';
  justify?:
    | 'normal'
    | 'space-around'
    | 'space-between'
    | 'space-evenly'
    | 'center'
    | 'stretch';
  size?: GapSizeType;
  wrap?: boolean;
  vertical?: boolean;
  className?: string;
  fullWidth?: boolean;
  fullHeight?: boolean;
}>) => {
  const controlClasses = {
    [`bh-gap--size-${size}`]: true,
    [`bh-gap--align-${align}`]: true,
    [`bh-gap--justify-${justify}`]: true,
    'bh-gap--vertical': vertical,
    'bh-gap--wrap': wrap,
    'bh-gap--full-width': fullWidth,
    'bh-gap--full-height': fullHeight,
  };

  return (
    <div className={clsx('bh-gap', className, controlClasses)}>{children}</div>
  );
};
