import { Struct } from "../types";
import { ok } from "../util";

/**
 * A passthrough struct that accepts any value but marks it as `any`.
 */
export const any: Struct<any> = (input) => ok(input);

if (import.meta.vitest) {
  const { describe, it } = import.meta.vitest;
  const { expectOk: assertOk } = await import("../test-util");

  const cases = [null, undefined, "", 0, false, true, {}, [], new Date()];

  describe.each(cases)(".any()", (value) => {
    it("always returns ok", () => assertOk(any(value), value));
  });
}
