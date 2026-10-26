import { afterEach, describe, expect, it, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useDockHeight } from './layout-hooks';

const observers: { cb: () => void; disconnect: ReturnType<typeof vi.fn> }[] =
  [];

class FakeResizeObserver {
  disconnect = vi.fn();
  constructor(public cb: () => void) {
    observers.push(this);
  }
  observe() {}
}

afterEach(() => {
  observers.length = 0;
  document.documentElement.style.removeProperty('--bh-dock-height');
});

describe('useDockHeight', () => {
  it('publishes the docked panel height plus a gap, and follows changes', () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);
    const el = document.createElement('div');
    let height = 60;
    Object.defineProperty(el, 'offsetHeight', { get: () => height });
    const root = document.documentElement;

    const { unmount } = renderHook(() => useDockHeight({ current: el }));
    expect(root.style.getPropertyValue('--bh-dock-height')).toBe('68px');

    height = 100;
    observers[0].cb();
    expect(root.style.getPropertyValue('--bh-dock-height')).toBe('108px');

    unmount();
    expect(observers[0].disconnect).toHaveBeenCalled();
    expect(root.style.getPropertyValue('--bh-dock-height')).toBe('');
  });

  it('does nothing without an element', () => {
    vi.stubGlobal('ResizeObserver', FakeResizeObserver);

    renderHook(() => useDockHeight({ current: null }, 4));

    expect(observers).toHaveLength(0);
  });
});
