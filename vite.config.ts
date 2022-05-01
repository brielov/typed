/// <reference types="vitest" />

import dts from "vite-plugin-dts";
import { defineConfig } from "vite";
import { resolve } from "path";

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
  },
});
