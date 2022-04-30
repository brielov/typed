import { Struct } from "../types";
import { StructError } from "../error";
import { err, isErr, isObject, ok } from "../util";

/**
 * Creates a new type that accepts an object with a given key struct and value struct.
 * It behaves like a typescript `Record` type.
 */
export const record =
  <K extends string, T>(
    key: Struct<K>,
    value: Struct<T>,
    msg = "Expecting object",
  ): Struct<Record<K, T>> =>
  (input) => {
    if (!isObject(input)) return err(new StructError(msg, { input, path: [] }));
    const obj = Object.create(null);
    for (const [k, v] of Object.entries(input)) {
      const kr = key(k);
      if (isErr(kr)) {
        kr.error.info.path.unshift(k);
        return kr;
      }
      const vr = value(v);
      if (isErr(vr)) {
        vr.error.info.path.unshift(k);
        return vr;
      }
      obj[kr.value] = vr.value;
    }
    return ok(obj);
  };

if (import.meta.vitest) {
  const { it } = import.meta.vitest;
  const { expectErr, expectOk } = await import("../test-util");
  const { string } = await import("./string");
  const { number } = await import("./number");
  const { literal } = await import("./literal");

  const struct = record(string(), number("number test"), "test");

  it("has default error", () => {
    const struct = record(string(), number("number test"));
    expectErr(struct(null), "Expecting object");
  });

  it("returns ok if the input is an object", () =>
    expectOk(struct({ a: 1, b: 2 }), { a: 1, b: 2 }));

  it("returns err if the input is not an object", () =>
    expectErr(struct(1), "test", { input: 1, path: [] }));

  it("returns err if input key is not the same as struct", () => {
    const struct = record(
      literal("foo", "foo test"),
      number("number test"),
      "test",
    );

    expectErr(struct({ foo: 1, bar: 2 }), "foo test", {
      input: "bar",
      path: ["bar"],
    });
  });

  it("returns err if a property is invalid", () =>
    expectErr(struct({ a: 1, b: "2" }), "number test", {
      input: "2",
      path: ["b"],
    }));
}
