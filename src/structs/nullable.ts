import { Struct } from "../types";
import { isNull, ok } from "../util";

/**
 * Creates a new struct that accepts either the specified struct or null.
 */
export const nullable =
  <T>(struct: Struct<T>): Struct<T | null> =>
  (input) =>
    isNull(input) ? ok(input) : struct(input);

if (import.meta.vitest) {
  const { it } = import.meta.vitest;
  const { expectErr, expectOk } = await import("../test-util");
  const { number } = await import("./number");

  const struct = nullable(number("test"));

  it("returns ok if the input is null", () => expectOk(struct(null), null));

  it("returns ok if the input is a number", () => expectOk(struct(1), 1));

  it("returns err if the input is not null or a number", () =>
    expectErr(struct("hello"), "test", {
      input: "hello",
      path: [],
    }));
}
