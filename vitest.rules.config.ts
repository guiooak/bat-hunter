import { defineConfig } from 'vitest/config';

// Database rules tests: they need the Firebase emulator (Java), so they run on
// their own with `yarn test:rules`, not in the unit test suite.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['rules/**/*.test.ts'],
    testTimeout: 15_000,
    fileParallelism: false,
  },
});
