import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["lib/ptx/**/*.test.ts"],
    environment: "node",
  },
});
