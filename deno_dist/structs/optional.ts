import { Struct } from "../types.ts";
import { isUndefined, ok } from "../util.ts";

/**
 * Creates a new struct that accepts either the specified struct or undefined.
 */
export const optional =
  <T>(struct: Struct<T>): Struct<T | undefined> =>
  (input) =>
    isUndefined(input) ? ok(input) : struct(input);
