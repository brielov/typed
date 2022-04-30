import { Struct } from "../types";
import { StructError } from "../error";
import { err, isBoolean, ok } from "../util";

/**
 * Creates a new struct that accepts a boolean.
 */
export const boolean =
  (msg = "Expecting boolean"): Struct<boolean> =>
  (input) =>
    isBoolean(input)
      ? ok(input)
      : err(new StructError(msg, { input, path: [] }));

if (import.meta.vitest) {
  const { it } = import.meta.vitest;
  const { expectErr: assertErr, expectOk: assertOk } = await import(
    "../test-util"
  );

  it("returns err if input is not a boolean", () => {
    const struct = boolean("test");
    const actual = struct(null);
    assertErr(actual, "test", { input: null, path: [] });
  });

  it("returns ok if input is a boolean", () => {
    const struct = boolean("test");
    assertOk(struct(true), true);
    assertOk(struct(false), false);
  });
}
