import { Infer, InferTuple, Struct } from "../types";
import { StructError } from "../error";
import { err, isOk } from "../util";

/**
 * Creates a new struct that accepts any of the given structs.
 * It behaves like a union type: A | B | C.
 */
export const union = <A extends Struct, B extends Struct[]>(
  structs: [A, ...B],
  msg = "Expecting one of the specified structs",
): Struct<Infer<A> | InferTuple<B>[number]> => {
  return (input) => {
    for (const struct of structs) {
      const result = struct(input);
      if (isOk(result)) return result;
    }
    return err(new StructError(msg, { input, path: [] }));
  };
};

if (import.meta.vitest) {
  const { it } = import.meta.vitest;
  const { expectErr, expectOk } = await import("../test-util");
  const { string } = await import("./string");
  const { number } = await import("./number");

  const struct = union([string("string test"), number("number test")]);

  it("returns err if no union matches", () =>
    expectErr(struct([]), "Expecting one of the specified structs"));

  it("returns ok if the input is a string", () =>
    expectOk(struct("hello"), "hello"));

  it("returns ok if the input is a number", () => expectOk(struct(1), 1));

  it("returns err if the input is not a string or number", () => {
    expectErr(struct(true), "Expecting one of the specified structs", {
      input: true,
      path: [],
    });
    expectErr(struct({}), "Expecting one of the specified structs", {
      input: {},
      path: [],
    });
  });
}
