import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}', 'scripts/**/*.test.{ts,mjs}'],
      restoreMocks: true,
      // A fake demo project, so tests never depend on (or reach) the real one
      env: {
        VITE_FIREBASE_API_KEY: 'demo-key',
        VITE_FIREBASE_AUTH_DOMAIN: 'demo-bat-hunter.firebaseapp.com',
        VITE_FIREBASE_DATABASE_URL: 'https://demo-bat-hunter.firebaseio.com',
        VITE_FIREBASE_PROJECT_ID: 'demo-bat-hunter',
        VITE_FIREBASE_STORAGE_BUCKET: '',
        VITE_FIREBASE_MESSAGING_SENDER_ID: '',
        VITE_FIREBASE_APP_ID: 'demo-app',
      },
      unstubGlobals: true,
      coverage: {
        provider: 'v8',
        include: ['src/**/*.{ts,tsx}', 'scripts/**/*.mjs'],
        exclude: ['src/vite-env.d.ts', 'src/test/**', '**/*.test.*'],
        reporter: ['text', 'html', 'json-summary'],
        // Every line, branch and function is covered: keep it that way
        thresholds: {
          lines: 100,
          statements: 100,
          functions: 100,
          branches: 100,
        },
      },
    },
  })
);
