import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { federation } from '@module-federation/vite';
import { federationBuildConfig } from '../../vite.shared.config.ts';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    federation({
      name: 'mf1Detail',
      filename: 'remoteEntry.js',
      exposes: {
        './PokemonDetail': './src/PokemonDetail.tsx',
      },
      // The `['react', 'react-dom']` shorthand implies `singleton: false`. Tried the
      // object form with explicit `singleton: true` for extra safety, but
      // @module-federation/vite@1.20.7 breaks on it in dev (`Pre-transform error: ...
      // without null bytes` on the `react-dom` virtual module, blank page). Reverted —
      // not worth trading a working dev server for a config-only hardening, especially
      // since all 3 apps already pin the identical `^19.2.8` React version.
      shared: ['react', 'react-dom'],
      // Without this, this app's compiled CSS never reaches the host — any styling
      // that "worked" was Shell's own Tailwind build coincidentally generating an
      // identically-named utility class. See docs/adr/002.
      bundleAllCSS: true,
    }),
  ],
  server: {
    port: 3001,
    strictPort: true,
    origin: 'http://localhost:3001',
  },
  preview: {
    port: 3001,
    strictPort: true,
  },
  build: federationBuildConfig,
});
