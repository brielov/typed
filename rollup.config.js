import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";

const name = require("./package.json").main.replace(/\.m?js$/, "");

const bundle = (config) => ({
  ...config,
  input: "src/mod.ts",
  external: (id) => !/^[./]/.test(id),
});

export default [
  bundle({
    plugins: [esbuild({ target: "esnext" })],
    output: [
      {
        file: `${name}.js`,
        format: "cjs",
      },
      {
        file: `${name}.mjs`,
        format: "es",
      },
    ],
  }),
  bundle({
    plugins: [dts()],
    output: {
      file: `${name}.d.ts`,
      format: "es",
    },
  }),
];
