const benchmark = require("benchmark");
const { z: Z } = require("zod");
const S = require("superstruct");
const T = require("..");
const data = require("./data");

const typedType = T.object({
  name: T.string,
  age: T.number,
  address: T.object({
    street: T.string,
    number: T.string,
    zip: T.number,
  }),
  tags: T.array(T.string),
});

const superstructType = S.object({
  name: S.string(),
  age: S.number(),
  address: S.object({
    street: S.string(),
    number: S.string(),
    zip: S.number(),
  }),
  tags: S.array(S.string()),
});

const zodType = Z.object({
  name: Z.string(),
  age: Z.number(),
  address: Z.object({
    street: Z.string(),
    number: Z.string(),
    zip: Z.number(),
  }),
  tags: Z.array(Z.string()),
});

const suite = new benchmark.Suite();

suite.add("typed", () => typedType(data));
suite.add("superstruct", () => S.create(data, superstructType));
suite.add("zod", () => zodType.safeParse(data));

suite.on("cycle", (event) => {
  console.log(String(event.target));
});

suite.on("complete", function () {
  console.log("Fastest is " + this.filter("fastest").map("name"));
});

suite.run({ async: true });
