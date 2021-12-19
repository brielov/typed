import commonjs from "@rollup/plugin-commonjs";
import dts from "rollup-plugin-dts";
import esbuild from "rollup-plugin-esbuild";
import { nodeResolve as resolve } from "@rollup/plugin-node-resolve";

const name = require("./package.json").main.replace(/\.m?js$/, "");
const deps = Object.keys(require("./package.json").dependencies);

const bundle = (config) => ({
  ...config,
  input: "src/index.ts",
  external: (id) => {
    if (deps.includes(id)) return false;
    return !/^[./]/.test(id);
  },
});

export default [
  bundle({
    plugins: [
      resolve(),
      commonjs(),
      esbuild({ minify: true, target: "esnext" }),
    ],
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
