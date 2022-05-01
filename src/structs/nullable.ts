import { Struct } from "../types";
import { isNull, ok } from "../util";

/**
 * Creates a new struct that accepts either the specified struct or null.
 */
export const nullable =
  <T>(struct: Struct<T>): Struct<T | null> =>
  (input) =>
    isNull(input) ? ok(input) : struct(input);
