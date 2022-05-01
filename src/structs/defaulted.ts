import { Struct } from "../types";
import { isUndefined, ok } from "../util";

/**
 * Creates a new struct that will return a default value if the input is undefined.
 */
export const defaulted =
  <T>(struct: Struct<T>, defaultValue: T): Struct<T> =>
  (input) =>
    isUndefined(input) ? ok(defaultValue) : struct(input);
