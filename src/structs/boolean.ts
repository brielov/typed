import { Struct } from "../types";
import { StructError } from "../error";
import { err, isBoolean, ok } from "../util";

/**
 * Creates a new struct that accepts a boolean.
 */
export const boolean =
  (msg = "Expecting boolean"): Struct<boolean> =>
  (input) =>
    isBoolean(input)
      ? ok(input)
      : err(new StructError(msg, { input, path: [] }));
