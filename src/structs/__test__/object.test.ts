import { boolean } from "../boolean";
import { expectErr, expectOk } from "../../test-util";
import { number } from "../number";
import { object } from "../object";
import { optional } from "../optional";
import { string } from "../string";

const struct = object(
  {
    a: string("string test"),
    b: number(),
    c: optional(boolean()),
  },
  "test",
);

it("returns ok if the input is an object", () =>
  expectOk(struct({ a: "hello", b: 1 }), { a: "hello", b: 1 }));

it("returns err if the input is not an object", () =>
  expectErr(struct(1), "test", { input: 1, path: [] }));

it("returns err if a property is invalid", () => {
  expectErr(struct({ a: 1, b: 1 }), "string test", { input: 1, path: ["a"] });
});
