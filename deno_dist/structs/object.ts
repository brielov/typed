import { Infer, Shape, Struct } from "../types.ts";
import { StructError } from "../error.ts";
import { err, isErr, isObject, ok } from "../util.ts";

/**
 * Creates a new struct that accepts an object with the given shape.
 */
export const object = <S extends Shape>(
  shape: S,
  msg = "Expecting object",
): Struct<Infer<S>> => {
  const entries = Object.entries(shape);
  return (input) => {
    if (!isObject(input)) return err(new StructError(msg, { input, path: [] }));
    const obj = Object.create(null);
    for (const [key, struct] of entries) {
      const result = struct(input[key]);
      if (isErr(result)) {
        result.error.info.path.unshift(key);
        return result;
      }
      obj[key] = result.value;
    }
    return ok(obj);
  };
};
