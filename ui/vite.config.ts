import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      common: path.resolve(__dirname, '../common/src/index.ts'),
    },
  },
  server: {
    port: 3002,
    proxy: {
      '/trpc': {
        target: 'http://localhost:3003',
        changeOrigin: true,
      },
    },
  },
  optimizeDeps: {
    exclude: ['pg', 'pg-pool', 'pg-types', 'postgres-bytea'],
  },
});
