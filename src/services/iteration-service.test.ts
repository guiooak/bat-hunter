import { describe, expect, it, vi } from 'vitest';
import { iterate } from './iteration-service';

describe('iterate', () => {
  it('calls back the given number of times with the index', () => {
    const cb = vi.fn((i: number) => i * 2);

    expect(iterate(3, cb)).toEqual([0, 2, 4]);
    expect(cb).toHaveBeenCalledTimes(3);
  });

  it('does nothing for zero', () => {
    const cb = vi.fn();

    expect(iterate(0, cb)).toEqual([]);
    expect(cb).not.toHaveBeenCalled();
  });
});
