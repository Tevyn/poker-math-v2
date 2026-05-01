import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
      // Vitest can't load the bundler-target wasm-pack output in Node;
      // route the `engine` import to the nodejs-target build instead.
      engine: path.resolve(__dirname, "../engine/pkg-node/engine.js"),
    },
  },
});
