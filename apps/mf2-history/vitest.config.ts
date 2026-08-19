import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { sharedTestConfig } from '../../vitest.shared.config.ts';

export default defineConfig({
  plugins: [react()],
  test: {
    ...sharedTestConfig,
    setupFiles: ['@testing-library/jest-dom/vitest'],
  },
});
