import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/tests/**/*.test.ts"],
    environment: "node",
    globalSetup: "./src/tests/setup.ts",
    globals: true,
  },
});
