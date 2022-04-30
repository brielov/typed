import { Struct } from "../types";
import { ok } from "../util";

/**
 * A passthrough struct that accepts any value but marks it as `unknown`.
 */
export const unknown: Struct<unknown> = (input) => ok(input);

if (import.meta.vitest) {
  const { describe, it } = import.meta.vitest;
  const { expectOk } = await import("../test-util");

  const cases = [null, undefined, "", 0, false, true, {}, [], new Date()];

  describe.each(cases)(".unknown()", (value) => {
    it("always returns ok", () => expectOk(unknown(value), value));
  });
}
