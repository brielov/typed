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
