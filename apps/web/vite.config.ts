import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';

const rootDir = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png'],
      manifest: {
        name: 'Synchem SFA',
        short_name: 'SFA',
        description: 'Pharma Sales Force Automation',
        theme_color: '#0891b2',
        background_color: '#f1f5f9',
        display: 'standalone',
        start_url: '/app',
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^\/api\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              networkTimeoutSeconds: 10,
              expiration: { maxEntries: 50, maxAgeSeconds: 60 * 5 },
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    conditions: ['development', 'browser', 'module', 'import', 'default'],
    alias: {
      '@': path.resolve(rootDir, 'src'),
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
