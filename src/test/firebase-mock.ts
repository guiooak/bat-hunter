import { vi } from 'vitest';

type Write = (...args: unknown[]) => Promise<void>;

// Shared fake of src/services/firebase-service for model and service tests:
// vi.mock('src/services/firebase-service', () => firebaseMock);
export const firebaseMock = {
  firebaseApp: {},
  getData: vi.fn(),
  getReactively: vi.fn(),
  setData: vi.fn<Write>(() => Promise.resolve()),
  updateData: vi.fn<Write>(() => Promise.resolve()),
  removeData: vi.fn<Write>(() => Promise.resolve()),
};
