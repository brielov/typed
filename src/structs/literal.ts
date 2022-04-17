import { Literal, Struct } from "../types";
import { StructError } from "../error";
import { err, ok } from "../util";

/**
 * Creates a new struct that accepts a literal.
 */
export const literal =
  <T extends Literal>(constant: T, msg = "Expecting literal"): Struct<T> =>
  (input) =>
    input === constant
      ? ok(input)
      : err(new StructError(msg, { input, path: [] }));
