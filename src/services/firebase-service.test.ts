import { beforeEach, describe, expect, it, vi } from 'vitest';

const db = vi.hoisted(() => ({
  ref: vi.fn((_db: unknown, path?: string) => ({ path: path ?? '/' })),
  child: vi.fn((_parent: unknown, path: string) => ({ path })),
  get: vi.fn(),
  set: vi.fn(() => Promise.resolve()),
  update: vi.fn(() => Promise.resolve()),
  remove: vi.fn(() => Promise.resolve()),
  onValue: vi.fn(),
}));

vi.mock('firebase/app', () => ({ initializeApp: vi.fn(() => ({ app: 1 })) }));
vi.mock('firebase/database', () => ({
  getDatabase: vi.fn(() => ({ db: 1 })),
  ...db,
}));

import {
  firebaseApp,
  getData,
  getReactively,
  removeData,
  setData,
  updateData,
} from './firebase-service';

describe('firebase service', () => {
  beforeEach(() => vi.clearAllMocks());

  it('initializes one Firebase app', () => {
    expect(firebaseApp).toEqual({ app: 1 });
  });

  it('reads a value, or null when there is none', async () => {
    db.get.mockResolvedValueOnce({ exists: () => true, val: () => ({ a: 1 }) });
    await expect(getData('users/u1')).resolves.toEqual({ a: 1 });
    expect(db.child).toHaveBeenCalledWith(expect.anything(), 'users/u1');

    db.get.mockResolvedValueOnce({ exists: () => false, val: () => null });
    await expect(getData('users/u2')).resolves.toBeNull();
  });

  it('writes, updates and removes at a path', async () => {
    await setData('a', 1);
    await updateData('b', { c: 2 });
    await removeData('d');

    expect(db.set).toHaveBeenCalledWith({ path: 'a' }, 1);
    expect(db.update).toHaveBeenCalledWith({ path: 'b' }, { c: 2 });
    expect(db.remove).toHaveBeenCalledWith({ path: 'd' });
  });

  it('listens to a path and returns the unsubscribe function', () => {
    const unsubscribe = vi.fn();
    db.onValue.mockReturnValueOnce(unsubscribe);
    const cb = vi.fn();

    expect(getReactively('matches/m1', cb)).toBe(unsubscribe);

    const [, onData] = db.onValue.mock.calls[0];
    onData({ val: () => 'value' });
    expect(cb).toHaveBeenCalledWith('value');
  });

  it('reports listener errors to the caller, or logs them', () => {
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const onError = vi.fn();
    const error = new Error('Permission denied');

    getReactively('matches/m1', vi.fn(), onError);
    db.onValue.mock.calls[0][2](error);
    expect(onError).toHaveBeenCalledWith(error);

    getReactively('matches/m2', vi.fn());
    db.onValue.mock.calls[1][2](error);
    expect(consoleError).toHaveBeenCalledWith(
      'getReactively::ERROR on "matches/m2"',
      error
    );
  });
});
