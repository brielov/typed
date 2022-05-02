import { Struct } from "../types.ts";
import { StructError } from "../error.ts";
import { err, isBoolean, ok } from "../util.ts";

/**
 * Creates a new struct that accepts a boolean.
 */
export const boolean =
  (msg = "Expecting boolean"): Struct<boolean> =>
  (input) =>
    isBoolean(input)
      ? ok(input)
      : err(new StructError(msg, { input, path: [] }));
