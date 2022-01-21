import { getTypeOf, map, ok, refine, toErr, toMismatchMsg } from "./util";
import { string } from "./types";

const noop = () => void 0;

describe(".toMismatchMsg()", () => {
  it("returns a type difference message", () => {
    expect(toMismatchMsg("number", "string")).toEqual(
      `Expecting type 'number'. Got type 'string'.`,
    );
  });
});

describe(".toErr()", () => {
  it("returns an error object", () => {
    expect(toErr("hello", ["1"])).toEqual({
      message: "hello",
      path: ["1"],
    });
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
  const t = map(string, (s) => ok(s.toUpperCase()));

  it("fails when input fail", () => {
    const result = t(1) as any;
    expect(result.ok).toEqual(false);
    expect(result.errors).toEqual([toErr(toMismatchMsg("string", "number"))]);
  });

  it("maps input to output", () => {
    const result = t("hello") as any;
    expect(result.ok).toEqual(true);
    expect(result.data).toEqual("HELLO");
  });
});

describe(".refine()", () => {
  const t = refine(string, (s) => s.trim().toUpperCase());

  it("fails when input fail", () => {
    const result = t(1) as any;
    expect(result.ok).toEqual(false);
    expect(result.errors).toEqual([toErr(toMismatchMsg("string", "number"))]);
  });

  it("maps input to output", () => {
    const result = t("   hello   ") as any;
    expect(result.ok).toEqual(true);
    expect(result.data).toEqual("HELLO");
  });
});
