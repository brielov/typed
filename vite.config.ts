import { resolve } from "path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    sourcemap: true,
    target: "es6",
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "typed",
      fileName: "typed",
      formats: ["cjs", "es", "umd"],
    },
  },
  plugins: [dts()],
  test: {
    setupFiles: ["test/test-setup.ts"],
  },
});
