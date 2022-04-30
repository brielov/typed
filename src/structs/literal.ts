import { Literal, Struct } from "../types";
import { StructError } from "../error";
import { err, ok } from "../util";

/**
 * Creates a new struct that accepts a literal.
 */
export const literal =
  <T extends Literal>(constant: T, msg = "Expecting literal"): Struct<T> =>
  (input) =>
    input === constant
      ? ok(input)
      : err(new StructError(msg, { input, path: [] }));

if (import.meta.vitest) {
  const { it } = import.meta.vitest;
  const { expectErr, expectOk } = await import("../test-util");

  const struct = literal("hello", "expecting hello");

  it('returns ok if the input is "hello"', () =>
    expectOk(struct("hello"), "hello"));

  it("has default error", () =>
    expectErr(literal("hello")("world"), "Expecting literal"));

  it('returns err if the input is not "hello"', () =>
    expectErr(struct("world"), "expecting hello", {
      input: "world",
      path: [],
    }));
}
