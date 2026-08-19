import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { federation } from '@module-federation/vite';
import { federationBuildConfig } from '../../vite.shared.config.ts';

// Module Federation needs the remotes' entry URLs at *build* time (this is a static config,
// not resolved per-request) — falls back to the local dev servers so `pnpm dev` needs zero
// setup, but a production build (e.g. on Vercel) must set these to the deployed MF1/MF2 URLs.
const MF1_ENTRY_URL = process.env.VITE_MF1_ENTRY_URL ?? 'http://localhost:3001/remoteEntry.js';
const MF2_ENTRY_URL = process.env.VITE_MF2_ENTRY_URL ?? 'http://localhost:3002/remoteEntry.js';

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
          entry: MF1_ENTRY_URL,
        },
        mf2History: {
          type: 'module',
          name: 'mf2History',
          entry: MF2_ENTRY_URL,
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
