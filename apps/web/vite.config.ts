import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    conditions: ['development', 'browser', 'module', 'import', 'default'],
    alias: {
      '@synchem-sfa/shared-i18n': path.resolve(
        rootDir,
        '../../packages/shared-i18n/src/index.ts',
      ),
      '@synchem-sfa/shared-types': path.resolve(
        rootDir,
        '../../packages/shared-types/src/index.ts',
      ),
    },
    dedupe: ['@synchem-sfa/shared-i18n', '@synchem-sfa/shared-types'],
  },
  optimizeDeps: {
    exclude: ['@synchem-sfa/shared-i18n', '@synchem-sfa/shared-types'],
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
