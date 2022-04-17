import { boolean } from "../boolean";
import { number } from "../number";
import { object } from "../object";
import { optional } from "../optional";
import { string } from "../string";

describe(".object()", () => {
  const struct = object(
    {
      a: string("string test"),
      b: number(),
      c: optional(boolean()),
    },
    "test",
  );

  it("returns ok if the input is an object", () =>
    expect(struct({ a: "hello", b: 1 })).toBeOk({ a: "hello", b: 1 }));

  it("returns err if the input is not an object", () => {
    expect(struct(1)).toBeErr("test", { input: 1, path: [] });
  });

  it("returns err if a property is invalid", () => {
    expect(struct({ a: 1, b: 1 })).toBeErr("string test", {
      input: 1,
      path: ["a"],
    });
  });
});
