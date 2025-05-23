import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/tests/**/*.test.ts"],
    setupFiles: "./src/tests/setup.ts",
    environment: "node",
    globals: true,
  },
});
