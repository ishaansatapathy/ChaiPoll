import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["**/*.test.js"],
    setupFiles: ["./test/setup.js"],
    env: { VITEST: "true" },
    // Integration suites each start MongoMemoryReplSet; parallel files = triple Mongo download + timeouts in CI
    fileParallelism: false,
    hookTimeout: 300_000,
    testTimeout: 30_000,
  },
});
