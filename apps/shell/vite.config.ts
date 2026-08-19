import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { federation } from '@module-federation/vite';

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
      shared: ['react', 'react-dom'],
      bundleAllCSS: true,
    }),
  ],
  server: {
    port: 3000,
    strictPort: true,
  },
  build: {
    target: 'esnext',
    modulePreload: false,
  },
});
