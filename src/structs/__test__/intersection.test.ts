import { boolean } from "../boolean";
import { expectErr, expectOk } from "../../test-util";
import { intersection } from "../intersection";
import { number } from "../number";
import { object } from "../object";
import { optional } from "../optional";
import { string } from "../string";

const structA = object({
  a: number("a"),
});

const structB = object({
  b: string("b error"),
  c: optional(boolean("c")),
});

const struct = intersection([structA, structB]);

it("returns err if the input is not the same struct", () =>
  expectErr(struct({ a: 1 }), "b error", { path: ["b"] }));

it("returns ok if the input is the same struct", () =>
  expectOk(struct({ a: 1, b: "2", c: true }), { a: 1, b: "2", c: true }));
