import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.test.{ts,tsx}"],
    setupFiles: ["./src/test-setup.ts"],
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
