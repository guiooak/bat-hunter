import clsx from 'clsx';
import { PropsWithChildren } from 'react';

const GUTTER_SIZE_MAP = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 40,
};

type GutterSizeType = keyof typeof GUTTER_SIZE_MAP;

type DirectionType =
  | 'all'
  | 'vertical'
  | 'horizontal'
  | 'top'
  | 'bottom'
  | 'left'
  | 'right';

export const Gutter = ({
  size = 'sm',
  fit = false,
  external = false,
  direction = 'all',
  className,
  children,
}: PropsWithChildren<{
  size?: GutterSizeType;
  fit?: boolean;
  external?: boolean;
  direction?: DirectionType;
  className?: string;
}>) => {
  const numericSize = GUTTER_SIZE_MAP[size];
  const gutterKind = external ? 'margin' : 'padding';
  const style = buildStyle(gutterKind, direction, numericSize);

  return (
    <div
      className={clsx('bh-gutter', className)}
      style={{
        display: fit ? 'inline-block' : 'block',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

function buildStyle(
  gutterKind: 'padding' | 'margin',
  direction: DirectionType,
  numericSize: number
) {
  if (direction === 'vertical') {
    return {
      [`${gutterKind}Top`]: numericSize,
      [`${gutterKind}Bottom`]: numericSize,
    };
  }

  if (direction === 'horizontal') {
    return {
      [`${gutterKind}Left`]: numericSize,
      [`${gutterKind}Right`]: numericSize,
    };
  }

  if (direction === 'top') {
    return {
      [`${gutterKind}Top`]: numericSize,
    };
  }

  if (direction === 'bottom') {
    return {
      [`${gutterKind}Bottom`]: numericSize,
    };
  }

  if (direction === 'left') {
    return {
      [`${gutterKind}Left`]: numericSize,
    };
  }

  if (direction === 'right') {
    return {
      [`${gutterKind}Right`]: numericSize,
    };
  }

  return {
    [gutterKind]: numericSize,
  };
}
