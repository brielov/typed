import { Err, Ok } from "rsts";

import { TypeErr } from ".";
import { getTypeOf, map, refine, toErr, toMismatchMsg } from "./util";
import { string } from "./types";

const noop = () => {
  return void 0;
};

describe(".toMismatchMsg()", () => {
  it("returns a type difference message", () => {
    expect(toMismatchMsg("number", "string")).toEqual(
      `Expecting type 'number'. Got type 'string'.`,
    );
  });
});

describe(".toErr()", () => {
  it("returns an error object", () => {
    expect(toErr("hello", ["1"])).toEqual(new TypeErr("hello", ["1"]));
  });
});

describe.each([
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
])(".getTypeOf(%s)", (value, expected) => {
  it(`returns ${expected}`, () => {
    expect(getTypeOf(value)).toEqual(expected);
  });
});

describe(".map()", () => {
  const t = map(string, (s) => Ok(s.toUpperCase()));

  it("fails when input fail", () => {
    expect(t(1)).toEqual(Err(toErr(toMismatchMsg("string", "number"))));
  });

  it("maps input to output", () => {
    expect(t("hello")).toEqual(Ok("HELLO"));
  });
});

describe(".refine()", () => {
  const t = refine(string, (s) => s.trim().toUpperCase());

  it("fails when input fail", () => {
    expect(t(1)).toEqual(Err(toErr(toMismatchMsg("string", "number"))));
  });

  it("maps input to output", () => {
    expect(t("   hello   ")).toEqual(Ok("HELLO"));
  });
});
