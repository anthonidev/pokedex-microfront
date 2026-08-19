import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { federation } from '@module-federation/vite';

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
  build: {
    target: 'esnext',
    modulePreload: false,
  },
});
