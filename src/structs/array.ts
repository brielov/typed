import { Struct } from "../types";
import { StructError } from "../error";
import { err, isArray, isErr, ok } from "../util";

/**
 * Creates a new struct that accepts an array of the given struct.
 */
export const array =
  <T>(struct: Struct<T>, msg = "Expecting array"): Struct<T[]> =>
  (input) => {
    if (!isArray(input)) return err(new StructError(msg, { input, path: [] }));
    const arr: T[] = new Array(input.length);
    for (const [i, x] of input.entries()) {
      const result = struct(x);
      if (isErr(result)) {
        result.error.info.path.unshift(i.toString());
        return result;
      }
      arr[i] = result.value;
    }
    return ok(arr);
  };
