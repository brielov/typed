import { Err, Ok } from "../../result";
import { isPlainObject } from "../../type-guards";
import { InferShape, Struct } from "../types";
import { createError } from "../util";

export function object<T extends { [key: string]: Struct }>(
  shape: T,
): Struct<InferShape<T>> {
  const entries = Object.entries(shape);
  return (input) => {
    if (!isPlainObject(input)) return Err(createError());
    const obj = Object.create(null);
    for (const [key, struct] of entries) {
      const result = struct(obj[key]);
      if (result.isErr()) {
        return Err(result.unwrapErr());
      }
    }
    return Ok(obj);
  };
}
