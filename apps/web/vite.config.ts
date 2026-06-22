import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@synchem-sfa/shared-i18n': path.resolve(
        __dirname,
        '../../packages/shared-i18n/src/index.ts',
      ),
      '@synchem-sfa/shared-types': path.resolve(
        __dirname,
        '../../packages/shared-types/src/index.ts',
      ),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/token': 'http://localhost:3001',
      '/health': 'http://localhost:3001',
      '/ready': 'http://localhost:3001',
      '/api': 'http://localhost:3001',
    },
  },
});
