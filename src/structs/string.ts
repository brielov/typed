import { Struct } from "../types";
import { StructError } from "../error";
import { err, isString, ok } from "../util";

/**
 * Creates a new struct that accepts a string.
 */
export const string =
  (msg = "Expecting string"): Struct<string> =>
  (input) =>
    isString(input)
      ? ok(input)
      : err(new StructError(msg, { input, path: [] }));

/**
 * Creates a new struct that will try to parse the input as a string.
 */
export const asString = (msg?: string): Struct<string> => {
  const fn = string(msg);
  return (input) => fn(String(input));
};

if (import.meta.vitest) {
  const { describe, it } = import.meta.vitest;
  const { expectErr, expectOk } = await import("../test-util");

  const struct = string("test");

  describe(".string()", () => {
    it("returns ok if the input is a string", () =>
      expectOk(struct("hello"), "hello"));

    it("returns err if the input is not a string", () =>
      expectErr(struct(1), "test", { input: 1, path: [] }));
  });

  describe(".asString()", () => {
    it("converts the input to a string", () => expectOk(asString()(1), "1"));
  });
}
