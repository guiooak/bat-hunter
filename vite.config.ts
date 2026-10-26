import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// Libraries in chunks of their own: the app code changes on every deploy, they
// don't, so browsers keep them cached
const VENDOR_CHUNKS: Record<string, string[]> = {
  firebase: ['firebase', '@firebase'],
  react: ['react', 'react-dom', 'react-router', 'scheduler'],
};

function vendorChunk(id: string) {
  const match = id.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  if (!match) return;

  const pkg = match[1];

  return Object.keys(VENDOR_CHUNKS).find((chunk) =>
    VENDOR_CHUNKS[chunk].some(
      (name) => pkg === name || pkg.startsWith(`${name}/`)
    )
  );
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      src: '/src',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: vendorChunk,
      },
    },
  },
});
