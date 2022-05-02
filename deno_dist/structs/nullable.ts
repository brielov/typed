import { Struct } from "../types.ts";
import { isNull, ok } from "../util.ts";

/**
 * Creates a new struct that accepts either the specified struct or null.
 */
export const nullable =
  <T>(struct: Struct<T>): Struct<T | null> =>
  (input) =>
    isNull(input) ? ok(input) : struct(input);
