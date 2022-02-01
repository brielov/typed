import { assertEquals } from "https://deno.land/std@0.123.0/testing/asserts.ts";

import {
  err,
  getTypeOf,
  map,
  ok,
  refine,
  toErr,
  toMismatchMsg,
} from "./util.ts";
import { string } from "./types.ts";

const noop = () => void 0;

Deno.test("toMismatchMsg - creates mismatch message", () => {
  const msg = toMismatchMsg("number", "string");
  assertEquals(msg, "Expecting type 'number'. Got type 'string'.");
});

Deno.test("toErr - creates error object", () => {
  const err = toErr("foo", ["1"]);
  assertEquals(err, { message: "foo", path: ["1"] });
});

const cases = [
  ["", "string"],
  [1, "number"],
  [true, "boolean"],
  [{}, "object"],
  [[], "array"],
  [null, "null"],
  [undefined, "undefined"],
  [Symbol("hello"), "symbol"],
  [noop, "function"],
  [new Date(), "date"],
  [new Error(), "error"],
  [new RegExp(""), "regexp"],
  [new Map(), "map"],
  [new Set(), "set"],
  [new WeakMap(), "weakmap"],
  [new WeakSet(), "weakset"],
  [new Promise(noop), "promise"],
  [BigInt(9007199254740991), "bigint"],
];

for (const [value, expected] of cases) {
  Deno.test(`getTypeOf - returns ${expected as string}`, () =>
    assertEquals(getTypeOf(value), expected)
  );
}

Deno.test("map - fails when input fails", () => {
  const type = map(string, (s) => ok(s.toUpperCase()));
  assertEquals(type(1), err(toErr(toMismatchMsg("string", "number"))));
});

Deno.test("map - maps input to output", () => {
  const type = map(string, (s) => ok(s.toUpperCase()));
  assertEquals(type("hello"), ok("HELLO"));
});

Deno.test("refine - fails when input fails", () => {
  const type = refine(string, (s) => s.trim().toUpperCase());
  assertEquals(type(1), err(toErr(toMismatchMsg("string", "number"))));
});

Deno.test("refine - maps input to output", () => {
  const type = refine(string, (s) => s.trim().toUpperCase());
  assertEquals(type("   hello   "), ok("HELLO"));
});
