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

if (import.meta.vitest) {
  const { it } = import.meta.vitest;
  const { any } = await import("./any");
  const { string } = await import("./string");
  const { expectErr: assertErr, expectOk: assertOk } = await import(
    "../test-util"
  );

  it("returns err if input is not an array", () => {
    const struct = array(any, "test");
    assertErr(struct(null), "test", { input: null, path: [] });
  });

  it("returns err if any of the array elements is not of the expected struct", () => {
    const struct = array(string("test"));
    const actual = struct(["a", "b", 2]);
    assertErr(actual, "test", { input: 2, path: ["2"] });
  });

  it("returns ok if all of the array elements are of the expected struct", () => {
    const struct = array(string("test"));
    const expected = ["a", "b", "c"];
    const actual = struct(expected);
    assertOk(actual, expected);
  });
}
