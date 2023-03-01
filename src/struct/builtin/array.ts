import { Err, Ok } from "../../result";
import { isArray } from "../../type-guards";
import { Struct } from "../types";
import { createError } from "../util";

export const array =
  <T>(struct: Struct<T>): Struct<T[]> =>
  (input) => {
    if (!isArray(input)) return Err(createError());
    const copy: T[] = new Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const result = struct(input[i]);
      if (result.isErr()) {
        return Err(result.unwrapErr());
      }
      copy.push(result.unwrap());
    }
    return Ok(copy);
  };
