import * as G from "./typed";
import { failure, success, toError, toMessage } from "./util";

describe.each([
  ["hello", success("hello")],
  [1, failure(toError(toMessage("string", "number")))],
  [true, failure(toError(toMessage("string", "boolean")))],
  [null, failure(toError(toMessage("string", "null")))],
])(".string(%s)", (value, expected) => {
  test(`returns ${expected.success ? "success" : "failure"}`, () => {
    expect(G.string(value)).toEqual(expected);
  });
});

describe.each([
  [1, success(1)],
  [NaN, failure(toError(`Expecting value to be a finite 'number'`))],
  ["hello", failure(toError(toMessage("number", "string")))],
  [true, failure(toError(toMessage("number", "boolean")))],
  [null, failure(toError(toMessage("number", "null")))],
])(".number(%s)", (value, expected) => {
  test(`returns ${expected.success ? "success" : "failure"}`, () => {
    expect(G.number(value)).toEqual(expected);
  });
});

describe.each([
  [true, success(true)],
  [false, success(false)],
  ["hello", failure(toError(toMessage("boolean", "string")))],
  [1, failure(toError(toMessage("boolean", "number")))],
  [null, failure(toError(toMessage("boolean", "null")))],
])(".boolean(%s)", (value, expected) => {
  test(`returns ${expected.success ? "success" : "failure"}`, () => {
    expect(G.boolean(value)).toEqual(expected);
  });
});

describe.each([
  [new Date("2021-10-27"), success(new Date("2021-10-27"))],
  [
    new Date("invalid date"),
    failure(toError(`Expecting value to be a valid 'date'`)),
  ],
  ["hello", failure(toError(toMessage("date", "string")))],
  [1, failure(toError(toMessage("date", "number")))],
  [null, failure(toError(toMessage("date", "null")))],
])(".date(%s)", (value, expected) => {
  test(`returns ${expected.success ? "success" : "failure"}`, () => {
    expect(G.date(value)).toEqual(expected);
  });
});

describe(".array()", () => {
  it("fails when value is not an array", () => {
    expect(G.array(G.string)({})).toEqual(
      failure(toError(toMessage("array", "object"))),
    );
  });

  it("fails when any of the items is not of the specified type", () => {
    expect(G.array(G.string)([1])).toEqual(
      failure(toError(toMessage("string", "number"), ["0"])),
    );
  });

  it("succeeds when every item is of the specified type", () => {
    expect(G.array(G.number)([1, 2, 3])).toEqual(success([1, 2, 3]));
  });
});

describe(".object()", () => {
  it("fails when value is not an object", () => {
    expect(G.object({})([])).toEqual(
      failure(toError(toMessage("object", "array"))),
    );
  });

  it("fails when the value does not conform to the shape", () => {
    expect(G.object({ id: G.number })({ id: "" })).toEqual(
      failure(toError(toMessage("number", "string"), ["id"])),
    );
  });

  it("succeeds when every type on shape succeeds", () => {
    expect(G.object({ id: G.number })({ id: 1 })).toEqual(success({ id: 1 }));
  });

  it("removes all properties that are not on the shape", () => {
    expect(G.object({ id: G.number })({ id: 1, name: "John" })).toEqual(
      success({ id: 1 }),
    );
  });
});

describe(".literal()", () => {
  it("throws an error when constant is not a valid literal", () => {
    expect(() => G.literal({} as any)).toThrow(TypeError);
  });

  it("fails when value is not equal to the constant", () => {
    expect(G.literal("hello")("hell")).toEqual(
      failure(toError(`Expecting literal 'hello'. Got 'hell'`)),
    );
  });

  it("succeeds when value is equal to constant", () => {
    expect(G.literal("hello")("hello")).toEqual(success("hello"));
  });
});

describe(".nullable()", () => {
  it("fails when value is not null", () => {
    expect(G.nullable(G.string)(undefined)).toEqual(
      failure(toError(toMessage("string", "undefined"))),
    );
  });

  it("succeeds when value is null", () => {
    expect(G.nullable(G.string)(null)).toEqual(success(null));
  });

  it("succeeds when type succeeds", () => {
    expect(G.nullable(G.string)("")).toEqual(success(""));
  });
});

describe(".optional()", () => {
  it("fails when value is not undefined", () => {
    expect(G.optional(G.string)(null)).toEqual(
      failure(toError(toMessage("string", "null"))),
    );
  });

  it("succeeds when value is undefined", () => {
    expect(G.optional(G.string)(undefined)).toEqual(success(undefined));
  });

  it("succeeds when type succeeds", () => {
    expect(G.optional(G.string)("")).toEqual(success(""));
  });
});

describe(".enums()", () => {
  enum Role {
    admin,
    user,
  }

  it("fails when value is not an enum", () => {
    const actual = G.enums(Role)("whatever");
    expect(actual).toEqual(
      failure(
        toError(
          `Expecting value to be '${Object.values(Role).join(
            " | ",
          )}'. Got 'whatever'`,
        ),
      ),
    );
  });

  it("succeeds when value is enum", () => {
    expect(G.enums(Role)(Role.admin)).toEqual(success(Role.admin));
  });
});

describe(".tuple()", () => {
  it("fails when value is not an array", () => {
    expect(G.tuple(G.string)({})).toEqual(
      failure(toError(toMessage("array", "object"))),
    );
  });

  it("fails when value has less items than tuple", () => {
    expect(G.tuple(G.string, G.number)([""])).toEqual(
      failure(toError(toMessage("number", "undefined"), ["1"])),
    );
  });

  it("succeeds when all types succeed", () => {
    expect(G.tuple(G.string, G.number, G.boolean)(["", 0, false])).toEqual(
      success(["", 0, false]),
    );
  });

  it("removes extra items", () => {
    expect(G.tuple(G.string, G.number)(["", 0, false])).toEqual(
      success(["", 0]),
    );
  });
});

describe(".union()", () => {
  it("fails when type fails", () => {
    expect(G.union(G.number, G.string)(false)).toEqual(
      failure(
        toError(toMessage("number", "boolean")),
        toError(toMessage("string", "boolean")),
      ),
    );
  });

  it("succeeds when type succeed", () => {
    expect(G.union(G.number, G.string)("")).toEqual(success(""));
  });
});

describe.each(["", 1, false, [], {}, null, undefined])(
  `.any(%s) returns success`,
  (value) => {
    expect(G.any(value)).toEqual(success(value));
  },
);

describe(".asString()", () => {
  it("coerces value to a string", () => {
    expect(G.asString(1)).toEqual(success("1"));
  });
});

describe(".asNumber()", () => {
  it("coerces value to a number", () => {
    expect(G.asNumber("1")).toEqual(success(1));
  });
});

describe(".asDate()", () => {
  it("coerces value to a date", () => {
    const d = new Date("2021-10-22");
    expect(G.asDate(d.toISOString())).toEqual(success(d));
  });
});

describe(".defaulted()", () => {
  it("fails when type fails", () => {
    expect(G.defaulted(G.string, "hello")(1)).toEqual(
      failure(toError(toMessage("string", "number"))),
    );
  });

  it("returns fallback when value is undefined", () => {
    expect(G.defaulted(G.string, "hello")(void 0)).toEqual(success("hello"));
  });

  it("returns value when is not undefined", () => {
    expect(G.defaulted(G.string, "hello")("world")).toEqual(success("world"));
  });
});
