import { Struct } from "../types";
import { StructError } from "../error";
import { err, isNumber, ok } from "../util";

/**
 * Creates a new struct that accepts a number.
 */
export const number =
  (msg = "Expecting number"): Struct<number> =>
  (input) =>
    isNumber(input)
      ? ok(input)
      : err(new StructError(msg, { input, path: [] }));

/**
 * Creates a new struct that will try to parse the input as a number.
 */
export const asNumber = (msg?: string): Struct<number> => {
  const fn = number(msg);
  return (input) => fn(Number(input));
};

if (import.meta.vitest) {
  const { describe, it } = import.meta.vitest;
  const { expectErr, expectOk } = await import("../test-util");

  describe(".number()", () => {
    const struct = number("test");

    it("returns ok if the input is a number", () => expectOk(struct(1), 1));

    it("returns err if the input is not a valid number", () =>
      expectErr(struct(NaN), "test", { input: NaN, path: [] }));

    it("returns err if the input is not a number", () =>
      expectErr(struct("hello"), "test", { input: "hello", path: [] }));
  });

  describe(".asNumber()", () => {
    const struct = asNumber("test");

    it("returns ok if the input is convertable to a number", () =>
      expectOk(struct("1"), 1));
  });
}
