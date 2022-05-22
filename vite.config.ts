/// <reference types="vitest" />

import dts from "vite-plugin-dts";
import { defineConfig } from "vite";
import { resolve } from "path";

const MIN_COVERAGE = 100;

export default defineConfig({
  plugins: [dts()],
  build: {
    target: "es2020",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "typed",
      formats: ["es", "umd"],
      fileName: "index",
    },
  },
  test: {
    globals: true,
    watch: false,
    coverage: {
      branches: MIN_COVERAGE,
      functions: MIN_COVERAGE,
      lines: MIN_COVERAGE,
      statements: MIN_COVERAGE,
    },
  },
});
