import { Enum, Struct } from "../types";
import { StructError } from "../error";
import { err, ok } from "../util";

/**
 * Creates a new struct that accepts a enum.
 */
export const enums = <T extends Enum>(
  e: T,
  msg?: string,
): Struct<T[keyof T]> => {
  const values = Object.values(e);
  msg ??= `Expecting one of ${values.join(", ")}`;
  return (input) =>
    values.includes(input)
      ? ok(input)
      : err(new StructError(msg as string, { input, path: [] }));
};

if (import.meta.vitest) {
  const { it } = import.meta.vitest;
  const { expectErr, expectOk } = await import("../test-util");

  enum TestEnum {
    A = 1,
    B = 2,
    C = 3,
  }

  const struct = enums(TestEnum, "test");

  it("returns ok if the input is a valid enum value", () =>
    expectOk(struct(TestEnum.A), TestEnum.A));

  it("returns err if the input is not a valid enum value", () =>
    expectErr(struct(null), "test", { input: null, path: [] }));
}
