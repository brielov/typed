import { Struct } from "../types.ts";
import { StructError } from "../error.ts";
import { err, isDate, isNumber, isString, ok } from "../util.ts";

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
