import { Struct } from "../types";
import { isUndefined, ok } from "../util";

/**
 * Creates a new struct that accepts either the specified struct or undefined.
 */
export const optional =
  <T>(struct: Struct<T>): Struct<T | undefined> =>
  (input) =>
    isUndefined(input) ? ok(input) : struct(input);

if (import.meta.vitest) {
  const { it } = import.meta.vitest;
  const { expectErr, expectOk } = await import("../test-util");
  const { number } = await import("./number");

  const struct = optional(number("test"));

  it("returns ok if the input is undefined", () =>
    expectOk(struct(undefined), undefined));

  it("returns ok if the input is a number", () => expectOk(struct(1), 1));

  it("returns err if the input is not undefined or a number", () =>
    expectErr(struct("hello"), "test", { input: "hello", path: [] }));
}
