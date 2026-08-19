// Ambient module augmentation for jest-dom's matchers (toBeInTheDocument, etc.) on vitest's
// `expect`. `tsconfig.app.json` sets an explicit `types` array, so this needs to be pulled in
// via an included file rather than relying on automatic @types resolution.
import '@testing-library/jest-dom/vitest';
