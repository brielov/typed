import { Struct } from "../types";
import { StructError } from "../error";
import { err, isDate, isNumber, isString, ok } from "../util";

/**
 * Creates a new struct that accepts a date.
 */
export const date =
  (msg = "Expecting date"): Struct<Date> =>
  (input) =>
    isDate(input)
      ? ok(new Date(input.getTime()))
      : err(new StructError(msg, { input, path: [] }));

/**
 * Creates a new struct that will try to parse the input as a date.
 */
export const asDate = (msg?: string): Struct<Date> => {
  const fn = date(msg);
  return (input) =>
    isString(input) || isNumber(input) ? fn(new Date(input)) : fn(input);
};

if (import.meta.vitest) {
  const { describe, it } = import.meta.vitest;
  const { expectErr: assertErr, expectOk: assertOk } = await import(
    "../test-util"
  );

  const struct = date("test");

  describe(".date()", () => {
    it("has default error", () =>
      assertErr(date()(undefined), "Expecting date", {
        input: undefined,
        path: [],
      }));

    it("returns err if input is not a date", () =>
      assertErr(struct(null), "test", { input: null, path: [] }));

    it("returns err if input is a date but it is invalid", () => {
      const struct = date("test");
      const value = new Date("invalid");
      assertErr(struct(value), "test", { input: value, path: [] });
    });

    it("returns ok if input is a date and it is valid", () => {
      const struct = date("test");
      const value = new Date();
      assertOk(struct(value), value);
    });
  });

  describe(".asDate()", () => {
    it("returns ok if the input is a string", () => {
      const struct = asDate("test");
      const value = "2020-01-01";
      assertOk(struct(value), new Date(value));
    });

    it("returns ok if the input is a number", () => {
      const struct = asDate("test");
      const value = 1577836800000;
      assertOk(struct(value), new Date(value));
    });

    it("returns err if the input is not a string or number", () => {
      const struct = asDate("test");
      assertErr(struct(true), "test", { input: true, path: [] });
      assertErr(struct({}), "test", { input: {}, path: [] });
    });
  });
}
