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
      name: 'mf2History',
      filename: 'remoteEntry.js',
      exposes: {
        './History': './src/History.tsx',
      },
      // The `['react', 'react-dom']` shorthand implies `singleton: false`. Tried the
      // object form with explicit `singleton: true` for extra safety, but
      // @module-federation/vite@1.20.7 breaks on it in dev (`Pre-transform error: ...
      // without null bytes` on the `react-dom` virtual module, blank page). Reverted —
      // not worth trading a working dev server for a config-only hardening, especially
      // since all 3 apps already pin the identical `^19.2.8` React version.
      shared: ['react', 'react-dom'],
      // Was `true` — turned off. Shell's own Tailwind build already scans this app's
      // source too (`@source '../../mf2-history/src'` in apps/shell/src/index.css), so it's
      // a strict superset of every class this app uses and doesn't need this app's CSS
      // injected into the host at all. Injecting it anyway caused a *worse* bug: two
      // independently-compiled Tailwind stylesheets in the same document merge their
      // same-named `@layer utilities`, so this app's own (duplicate, unconditional) `.flex`
      // ended up cascading after — and beating — Shell's `sm:hidden` for Shell's own mobile
      // nav, breaking every responsive utility in the Shell in production. Standalone mode
      // (this app alone on :3002) is unaffected — its own `index.html` imports its CSS
      // directly through the normal Vite pipeline, none of this is federation-specific.
      // See docs/adr/002.
      bundleAllCSS: false,
    }),
  ],
  server: {
    port: 3002,
    strictPort: true,
    origin: 'http://localhost:3002',
  },
  preview: {
    port: 3002,
    strictPort: true,
  },
  build: federationBuildConfig,
});
