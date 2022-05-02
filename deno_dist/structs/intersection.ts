import { Infer, InferTuple, Obj, Struct, UnionToIntersection } from "../types.ts";
import { isErr, ok } from "../util.ts";

/**
 * Creates a new struct that merges other structs.
 * Behaves like typescript `interface A extends B, C, D {}`
 */
export const intersection =
  <A extends Struct<Obj>, B extends Struct<Obj>[]>(
    structs: [A, ...B],
  ): Struct<Infer<A> & UnionToIntersection<InferTuple<B>[number]>> =>
  (input) => {
    const obj = Object.create(null);
    for (const struct of structs) {
      const result = struct(input);
      if (isErr(result)) return result;
      Object.assign(obj, result.value);
    }
    return ok(obj);
  };
