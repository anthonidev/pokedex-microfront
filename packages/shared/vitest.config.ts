import { defineConfig } from 'vitest/config';
import { sharedTestConfig } from '../../vitest.shared.config.ts';

export default defineConfig({
  test: sharedTestConfig,
});
