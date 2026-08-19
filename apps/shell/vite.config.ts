import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { federation } from '@module-federation/vite';
import { federationBuildConfig } from '../../vite.shared.config.ts';

export default defineConfig({
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'shell',
      remotes: {
        mf1Detail: {
          type: 'module',
          name: 'mf1Detail',
          entry: 'http://localhost:3001/remoteEntry.js',
        },
        mf2History: {
          type: 'module',
          name: 'mf2History',
          entry: 'http://localhost:3002/remoteEntry.js',
        },
      },
      // The `['react', 'react-dom']` shorthand implies `singleton: false`. Tried the
      // object form with explicit `singleton: true` for extra safety, but
      // @module-federation/vite@1.20.7 breaks on it in dev (`Pre-transform error: ...
      // without null bytes` on the `react-dom` virtual module, blank page). Reverted —
      // not worth trading a working dev server for a config-only hardening, especially
      // since all 3 apps already pin the identical `^19.2.8` React version.
      shared: ['react', 'react-dom'],
      bundleAllCSS: true,
    }),
  ],
  server: {
    port: 3000,
    strictPort: true,
  },
  build: federationBuildConfig,
});
