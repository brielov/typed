import { Infer, InferTuple, Struct } from "../types.ts";
import { StructError } from "../error.ts";
import { err, isArray, isErr, ok } from "../util.ts";

/**
 * Creates a new struct that accepts a tuple of the specified structs.
 */
export const tuple = <A extends Struct, B extends Struct[]>(
  structs: [A, ...B],
  msg = "Expecting tuple",
): Struct<[Infer<A>, ...InferTuple<B>]> => {
  const entries = [...structs.entries()];
  return (input) => {
    if (!isArray(input)) return err(new StructError(msg, { input, path: [] }));
    const arr = new Array(structs.length);
    for (const [i, struct] of entries) {
      const result = struct(input[i]);
      if (isErr(result)) {
        result.error.info.path.unshift(i.toString());
        return result;
      }
      arr[i] = result.value;
    }
    return ok(arr as any);
  };
};
