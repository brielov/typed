import { Err, Ok } from "../../result";
import { Infer, InferTuple, Struct } from "../types";
import { createError } from "../util";

export const union =
  <A extends Struct, B extends Struct[]>(
    structs: [A, ...B],
  ): Struct<Infer<A> | InferTuple<B>[number]> =>
  (input) => {
    for (const struct of structs) {
      const result = struct(input);
      if (result.isOk()) return Ok(result.unwrap() as any);
    }
    return Err(createError());
  };
