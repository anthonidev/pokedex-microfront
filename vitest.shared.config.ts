import type { UserConfig } from 'vitest/config';

/**
 * Test settings shared by every app + `packages/shared`. Mirrors `vite.shared.config.ts`.
 * `packages/shared`'s tests are pure logic (no RTL) so it doesn't need the jest-dom
 * matchers — each app's own `vitest.config.ts` adds `setupFiles` on top of this.
 */
export const sharedTestConfig: UserConfig['test'] = {
  environment: 'jsdom',
  globals: true,
};
