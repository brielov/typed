import { Struct } from "../types";
import { isUndefined, ok } from "../util";

/**
 * Creates a new struct that will return a default value if the input is undefined.
 */
export const defaulted =
  <T>(struct: Struct<T>, defaultValue: T): Struct<T> =>
  (input) =>
    isUndefined(input) ? ok(defaultValue) : struct(input);

if (import.meta.vitest) {
  const { it } = import.meta.vitest;
  const { number } = await import("./number");
  const { expectErr: assertErr, expectOk: assertOk } = await import(
    "../test-util"
  );
  const struct = defaulted(number("test"), 10);

  it("returns err if the input is not the same struct", () =>
    assertErr(struct("5"), "test", { input: "5", path: [] }));

  it("returns the default value if the input is undefined", () =>
    assertOk(struct(undefined), 10));

  it("returns the input if the input is defined", () => assertOk(struct(5), 5));
}
