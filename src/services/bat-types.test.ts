import { describe, expect, it } from 'vitest';
import {
  BAT_TYPE_NAMES,
  BAT_TYPES,
  isDifficulty,
  pickBatType,
} from './bat-types';

describe('bat types', () => {
  it('lists every type', () => {
    expect(BAT_TYPE_NAMES).toEqual(['normal', 'small', 'golden', 'owl']);
  });

  it('only the owl is innocent and costs points', () => {
    const innocents = BAT_TYPE_NAMES.filter((t) => BAT_TYPES[t].innocent);

    expect(innocents).toEqual(['owl']);
    expect(BAT_TYPES.owl.points).toBeLessThan(0);
  });
});

describe('isDifficulty', () => {
  it('accepts easy and hard only', () => {
    expect(isDifficulty('easy')).toBe(true);
    expect(isDifficulty('hard')).toBe(true);
    expect(isDifficulty('insane')).toBe(false);
    expect(isDifficulty(null)).toBe(false);
  });
});

describe('pickBatType', () => {
  it('always picks the regular bat in the easy mode', () => {
    expect(pickBatType('easy', () => 0.99)).toBe('normal');
  });

  it('picks by weight in the hard mode', () => {
    // weights: normal 60, small 25, golden 5, owl 10 (out of 100)
    expect(pickBatType('hard', () => 0)).toBe('normal');
    expect(pickBatType('hard', () => 0.59)).toBe('normal');
    expect(pickBatType('hard', () => 0.6)).toBe('small');
    expect(pickBatType('hard', () => 0.86)).toBe('golden');
    expect(pickBatType('hard', () => 0.95)).toBe('owl');
  });

  it('falls back to the regular bat if the roll is out of range', () => {
    expect(pickBatType('hard', () => 1)).toBe('normal');
  });

  it('uses Math.random by default', () => {
    expect(BAT_TYPE_NAMES).toContain(pickBatType('hard'));
  });
});
