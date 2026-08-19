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
      shared: ['react', 'react-dom'],
      // Without this, this app's compiled CSS never reaches the host — any styling
      // that "worked" was Shell's own Tailwind build coincidentally generating an
      // identically-named utility class. See docs/adr/002.
      bundleAllCSS: true,
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
