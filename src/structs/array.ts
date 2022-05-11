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

/**
 * Creates a new struct that will convert the input to an array before passing it to the given struct.
 */
export const asArray = <T>(
  struct: Struct<T>,
  msg = "Expecting array",
): Struct<T[]> => {
  const fn = array(struct, msg);
  return (input) => (isArray(input) ? fn(input) : fn([input]));
};

/**
 * Creates a new struct that will take the element at the given index of the input if it is an array, otherwise it will pass the input to the given struct.
 */
export const asOnly =
  <T>(struct: Struct<T>, index = 0): Struct<T> =>
  (input) =>
    Array.isArray(input) ? struct(input[index]) : struct(input);
