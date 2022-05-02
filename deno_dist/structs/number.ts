import { Struct } from "../types.ts";
import { StructError } from "../error.ts";
import { err, isNumber, ok } from "../util.ts";

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
