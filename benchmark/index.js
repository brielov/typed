const benchmark = require("benchmark");
const { validate } = require("superstruct");
const { typed, superstruct, zod } = require("./types");
const data = require("./data");

const suite = new benchmark.Suite();

suite.add("zod", () => zod.safeParse(data));
suite.add("superstruct", () => validate(data, superstruct, { coerce: true }));
suite.add("typed", () => typed(data));

suite.on("cycle", (event) => console.log(String(event.target)));

suite.on("complete", function () {
  console.log("Fastest is " + this.filter("fastest").map("name"));
});

console.log("🚀 Running benchmarks...");
suite.run({ async: true });
