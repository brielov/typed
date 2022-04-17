import { boolean } from "../boolean";
import { intersection } from "../intersection";
import { number } from "../number";
import { object } from "../object";
import { optional } from "../optional";
import { string } from "../string";

describe(".intersection()", () => {
  const structA = object({
    a: number("a"),
  });

  const structB = object({
    b: string("b error"),
    c: optional(boolean("c")),
  });

  const struct = intersection([structA, structB]);

  it("returns err if the input is not the same struct", () => {
    expect(struct({ a: 1 })).toBeErr("b error", { path: ["b"] });
  });

  it("returns ok if the input is the same struct", () => {
    expect(struct({ a: 1, b: "hello", c: true })).toBeOk({
      a: 1,
      b: "hello",
      c: true,
    });
  });
});
