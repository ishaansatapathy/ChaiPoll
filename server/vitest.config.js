import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['**/*.test.js'],
    env: { VITEST: 'true' },
    hookTimeout: 120_000,
    testTimeout: 30_000,
  },
});
