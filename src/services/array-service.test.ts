import { describe, expect, it } from 'vitest';
import { buildArray } from './array-service';

describe('buildArray', () => {
  it('returns an empty array for missing or non-object collections', () => {
    expect(buildArray(undefined)).toEqual([]);
    expect(buildArray(null)).toEqual([]);
    expect(buildArray('nope' as never)).toEqual([]);
  });

  it('sorts by createdAt, ascending by default, missing dates first', () => {
    const collection: Record<string, { id: string; createdAt?: number }> = {
      b: { id: 'b', createdAt: 20 },
      a: { id: 'a', createdAt: 10 },
      c: { id: 'c' },
    };

    expect(buildArray(collection).map((item) => item.id)).toEqual([
      'c',
      'a',
      'b',
    ]);
  });

  it('treats items without createdAt as the oldest', () => {
    const collection = { x: {}, y: { createdAt: 5 }, z: {} };

    expect(buildArray(collection, 'DESC')[0]).toEqual({ createdAt: 5 });
  });

  it('sorts descending on request', () => {
    const collection = { a: { createdAt: 1 }, b: { createdAt: 2 } };

    expect(buildArray(collection, 'DESC')).toEqual([
      { createdAt: 2 },
      { createdAt: 1 },
    ]);
  });
});
