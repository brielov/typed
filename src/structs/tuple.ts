import { Infer, InferTuple, Struct } from "../types";
import { StructError } from "../error";
import { err, isArray, isErr, ok } from "../util";

/**
 * Creates a new struct that accepts a tuple of the specified structs.
 */
export const tuple = <A extends Struct, B extends Struct[]>(
  structs: [A, ...B],
  msg = "Expecting tuple",
): Struct<[Infer<A>, ...InferTuple<B>]> => {
  const entries = [...structs.entries()];
  return (input) => {
    if (!isArray(input)) return err(new StructError(msg, { input, path: [] }));
    const arr = new Array(structs.length);
    for (const [i, struct] of entries) {
      const result = struct(input[i]);
      if (isErr(result)) {
        result.error.info.path.unshift(i.toString());
        return result;
      }
      arr[i] = result.value;
    }
    return ok(arr as any);
  };
};

if (import.meta.vitest) {
  const { it } = import.meta.vitest;
  const { expectErr, expectOk } = await import("../test-util");
  const { string } = await import("./string");
  const { number } = await import("./number");

  const struct = tuple([string(), number("number test")], "test");

  it("has default error", () => {
    const struct = tuple([string(), number("number test")]);
    expectErr(struct(null), "Expecting tuple");
  });

  it("returns ok if the input is an array", () =>
    expectOk(struct(["hello", 1]), ["hello", 1]));

  it("returns err if the input is not an array", () =>
    expectErr(struct(1), "test", { input: 1, path: [] }));

  it("returns err if the input is an array with an invalid element", () =>
    expectErr(struct(["hello", {}]), "number test", {
      input: {},
      path: ["1"],
    }));
}
