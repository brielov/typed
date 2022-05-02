import { Literal, Struct } from "../types.ts";
import { StructError } from "../error.ts";
import { err, ok } from "../util.ts";

/**
 * Creates a new struct that accepts a literal.
 */
export const literal =
  <T extends Literal>(constant: T, msg = "Expecting literal"): Struct<T> =>
  (input) =>
    input === constant
      ? ok(input)
      : err(new StructError(msg, { input, path: [] }));
