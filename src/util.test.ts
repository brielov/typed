import { failure, getTypeOf, success, toError, toMessage } from "./util";

const noop = () => {
  return void 0;
};

describe(".toMessage()", () => {
  it("returns a type difference message", () => {
    expect(toMessage("number", "string")).toEqual(
      `Expecting type 'number'. Got type 'string'`,
    );
  });
});

describe(".toError()", () => {
  it("returns an error object", () => {
    expect(toError("hello", ["1"])).toEqual({
      message: "hello",
      path: ["1"],
    });
  });
});

describe(".success()", () => {
  it("returns a success object", () => {
    expect(success("hello")).toEqual({
      success: true,
      value: "hello",
    });
  });
});

describe(".failure()", () => {
  it("returns a failure object", () => {
    expect(failure(toError("hello", ["1"]))).toEqual({
      success: false,
      errors: [toError("hello", ["1"])],
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
])(".getTypeOf(%s)", (value, expected) => {
  it(`returns ${expected}`, () => {
    expect(getTypeOf(value)).toEqual(expected);
  });
});
