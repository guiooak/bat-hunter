import { describe, expect, it, vi } from 'vitest';
import {
  getLocalStorageValue,
  setLocalStorageValue,
} from './local-storage-service';

describe('local storage service', () => {
  it('stores and reads JSON values', () => {
    setLocalStorageValue('bh-difficulty', 'hard');

    expect(localStorage.getItem('bh-difficulty')).toBe('"hard"');
    expect(getLocalStorageValue('bh-difficulty')).toBe('hard');
  });

  it('returns null for a missing key', () => {
    expect(getLocalStorageValue('bh-background-music-muted')).toBeNull();
  });

  it('returns null when the stored value is not JSON', () => {
    localStorage.setItem('bh-difficulty', '{broken');

    expect(getLocalStorageValue('bh-difficulty')).toBeNull();
  });

  it('returns null when storage throws', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });

    expect(getLocalStorageValue('bh-difficulty')).toBeNull();
  });
});
