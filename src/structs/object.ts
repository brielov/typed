import { Infer, Shape, Struct } from "../types";
import { StructError } from "../error";
import { err, isErr, isObject, ok } from "../util";

/**
 * Creates a new struct that accepts an object with the given shape.
 */
export const object = <S extends Shape>(
  shape: S,
  msg = "Expecting object",
): Struct<Infer<S>> => {
  const entries = Object.entries(shape);
  return (input) => {
    if (!isObject(input)) return err(new StructError(msg, { input, path: [] }));
    const obj = Object.create(null);
    for (const [key, struct] of entries) {
      const result = struct(input[key]);
      if (isErr(result)) {
        result.error.info.path.unshift(key);
        return result;
      }
      obj[key] = result.value;
    }
    return ok(obj);
  };
};

if (import.meta.vitest) {
  const { it } = import.meta.vitest;
  const { expectErr, expectOk } = await import("../test-util");
  const { string } = await import("./string");
  const { number } = await import("./number");
  const { optional } = await import("./optional");
  const { boolean } = await import("./boolean");

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
}
