import { Err, Ok } from "../../result";
import { isArray } from "../../type-guards";
import { Infer, InferTuple, Struct } from "../types";
import { createError } from "../util";

export const tuple = <A extends Struct, B extends Struct[]>(
  structs: [A, ...B],
): Struct<[Infer<A>, ...InferTuple<B>]> => {
  const entries = [...structs.entries()];
  return (input) => {
    if (!isArray(input)) return Err(createError());
    const arr = new Array(structs.length);
    for (const [i, struct] of entries) {
      const result = struct(input[i]);
      if (result.isErr()) {
        const err = result.unwrapErr();
        err.path.unshift(i.toString());
        return Err(err);
      }
      arr[i] = result.unwrap();
    }
    return Ok(arr as any);
  };
};
