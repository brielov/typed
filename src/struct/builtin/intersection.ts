import { Err, Ok } from "../../result";
import { PlainObject } from "../../types";
import { Infer, InferTuple, Struct, UnionToIntersection } from "../types";

export const intersection =
  <A extends Struct<PlainObject>, B extends Struct<PlainObject>[]>(
    structs: [A, ...B],
  ): Struct<Infer<A> & UnionToIntersection<InferTuple<B>[number]>> =>
  (input) => {
    const obj = Object.create(null);
    for (const struct of structs) {
      const result = struct(input);
      if (result.isErr()) return Err(result.unwrapErr());
      Object.assign(obj, result.unwrap());
    }
    return Ok(obj);
  };
