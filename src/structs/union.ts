import { Infer, InferTuple, Struct } from "../types";
import { StructError } from "../error";
import { err, isOk } from "../util";

/**
 * Creates a new struct that accepts any of the given structs.
 * It behaves like a union type: A | B | C.
 */
export const union = <A extends Struct, B extends Struct[]>(
  structs: [A, ...B],
  msg = "Expecting one of the specified structs",
): Struct<Infer<A> | InferTuple<B>[number]> => {
  return (input) => {
    for (const struct of structs) {
      const result = struct(input);
      if (isOk(result)) return result;
    }
    return err(new StructError(msg, { input, path: [] }));
  };
};
