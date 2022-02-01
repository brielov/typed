// ex. scripts/build_npm.ts
import { build } from "https://deno.land/x/dnt/mod.ts";

await build({
  entryPoints: ["./src/mod.ts"],
  outDir: "./npm",
  test: false,
  shims: {
    // see JS docs for overview and more options
    deno: false,
  },
  package: {
    // package.json properties
    name: "typed",
    version: Deno.args[0],
    description:
      "A blazing fast, dependency free, 1kb runtime type-checking library written entirely in typescript.",
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/brielov/typed.git",
    },
    bugs: {
      url: "https://github.com/brielov/typed/issues",
    },
  },
});

// post build steps
Deno.copyFileSync("LICENSE", "npm/LICENSE");
Deno.copyFileSync("README.md", "npm/README.md");
