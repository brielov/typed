import * as T from "./typed";
import { failure, success, toError, toMessage } from "./util";

describe.each([
  ["hello", success("hello")],
  [1, failure(toError(toMessage("string", "number")))],
  [true, failure(toError(toMessage("string", "boolean")))],
  [null, failure(toError(toMessage("string", "null")))],
])(".string(%s)", (value, expected) => {
  test(`returns ${expected.success ? "success" : "failure"}`, () => {
    expect(T.string(value)).toEqual(expected);
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
    expect(T.number(value)).toEqual(expected);
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
    expect(T.boolean(value)).toEqual(expected);
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
    expect(T.date(value)).toEqual(expected);
  });
});

describe(".array()", () => {
  it("fails when value is not an array", () => {
    expect(T.array(T.string)({})).toEqual(
      failure(toError(toMessage("array", "object"))),
    );
  });

  it("fails when any of the items is not of the specified type", () => {
    expect(T.array(T.string)([1])).toEqual(
      failure(toError(toMessage("string", "number"), ["0"])),
    );
  });

  it("succeeds when every item is of the specified type", () => {
    expect(T.array(T.number)([1, 2, 3])).toEqual(success([1, 2, 3]));
  });
});

describe(".object()", () => {
  it("fails when value is not an object", () => {
    expect(T.object({})([])).toEqual(
      failure(toError(toMessage("object", "array"))),
    );
  });

  it("fails when the value does not conform to the shape", () => {
    expect(T.object({ id: T.number })({ id: "" })).toEqual(
      failure(toError(toMessage("number", "string"), ["id"])),
    );
  });

  it("succeeds when every type on shape succeeds", () => {
    expect(T.object({ id: T.number })({ id: 1 })).toEqual(success({ id: 1 }));
  });

  it("removes all properties that are not on the shape", () => {
    expect(T.object({ id: T.number })({ id: 1, name: "John" })).toEqual(
      success({ id: 1 }),
    );
  });
});

describe(".literal()", () => {
  it("fails when value is not equal to the constant", () => {
    expect(T.literal("hello")("hell")).toEqual(
      failure(toError(`Expecting literal 'hello'. Got 'hell'`)),
    );
  });

  it("succeeds when value is equal to constant", () => {
    expect(T.literal("hello")("hello")).toEqual(success("hello"));
  });
});

describe(".nullable()", () => {
  it("fails when value is not null", () => {
    expect(T.nullable(T.string)(undefined)).toEqual(
      failure(toError(toMessage("string", "undefined"))),
    );
  });

  it("succeeds when value is null", () => {
    expect(T.nullable(T.string)(null)).toEqual(success(null));
  });

  it("succeeds when type succeeds", () => {
    expect(T.nullable(T.string)("")).toEqual(success(""));
  });
});

describe(".optional()", () => {
  it("fails when value is not undefined", () => {
    expect(T.optional(T.string)(null)).toEqual(
      failure(toError(toMessage("string", "null"))),
    );
  });

  it("succeeds when value is undefined", () => {
    expect(T.optional(T.string)(undefined)).toEqual(success(undefined));
  });

  it("succeeds when type succeeds", () => {
    expect(T.optional(T.string)("")).toEqual(success(""));
  });
});

describe(".enums()", () => {
  enum Role {
    admin,
    user,
  }

  it("fails when value is not an enum", () => {
    const actual = T.enums(Role)("whatever");
    expect(actual).toEqual(
      failure(
        toError(
          `Expecting value to be one of '${Object.values(Role).join(
            ", ",
          )}'. Got 'whatever'`,
        ),
      ),
    );
  });

  it("succeeds when value is enum", () => {
    expect(T.enums(Role)(Role.admin)).toEqual(success(Role.admin));
  });
});

describe(".tuple()", () => {
  it("fails when value is not an array", () => {
    expect(T.tuple(T.string)({})).toEqual(
      failure(toError(toMessage("array", "object"))),
    );
  });

  it("fails when value has less items than tuple", () => {
    expect(T.tuple(T.string, T.number)([""])).toEqual(
      failure(toError(toMessage("number", "undefined"), ["1"])),
    );
  });

  it("succeeds when all types succeed", () => {
    expect(T.tuple(T.string, T.number, T.boolean)(["", 0, false])).toEqual(
      success(["", 0, false]),
    );
  });

  it("removes extra items", () => {
    expect(T.tuple(T.string, T.number)(["", 0, false])).toEqual(
      success(["", 0]),
    );
  });

  it("can be tuple in tuple", () => {
    expect(
      T.tuple(
        T.tuple(T.number, T.number),
        T.string,
        T.boolean,
      )([[1, 2], "hello", true]),
    ).toEqual(success([[1, 2], "hello", true]));
  });
});

describe(".union()", () => {
  it("fails when type fails", () => {
    expect(T.union(T.number, T.string)(false)).toEqual(
      failure(
        toError(toMessage("number", "boolean")),
        toError(toMessage("string", "boolean")),
      ),
    );
  });

  it("succeeds when type succeed", () => {
    expect(T.union(T.number, T.string)("")).toEqual(success(""));
  });
});

describe.each(["", 1, false, [], {}, null, undefined])(
  `.any(%s) returns success`,
  (value) => {
    expect(T.any(value)).toEqual(success(value));
  },
);

describe(".asString()", () => {
  it("coerces value to a string", () => {
    expect(T.asString(1)).toEqual(success("1"));
  });
});

describe(".asNumber()", () => {
  it("coerces value to a number", () => {
    expect(T.asNumber("1")).toEqual(success(1));
  });
});

describe(".asDate()", () => {
  it("coerces value to a date", () => {
    const date = new Date("2021-10-22");
    expect(T.asDate(date.toISOString())).toEqual(success(date));
    expect(T.asDate(date.getTime())).toEqual(success(date));
  });

  it("returns failure when cohercion fails", () => {
    expect(T.asDate(false)).toEqual(
      failure(toError(toMessage("date", "boolean"))),
    );
  });
});

describe(".defaulted()", () => {
  it("fails when type fails", () => {
    expect(T.defaulted(T.string, "hello")(1)).toEqual(
      failure(toError(toMessage("string", "number"))),
    );
  });

  it("returns fallback when value is undefined", () => {
    expect(T.defaulted(T.string, "hello")(void 0)).toEqual(success("hello"));
  });

  it("returns value when is not undefined", () => {
    expect(T.defaulted(T.string, "hello")("world")).toEqual(success("world"));
  });
});

describe(".map()", () => {
  const t = T.map(T.string, (s) => success(s.toUpperCase()));

  it("fails when input fail", () => {
    expect(t(1)).toEqual(failure(toError(toMessage("string", "number"))));
  });

  it("maps input to output", () => {
    expect(t("hello")).toEqual(success("HELLO"));
  });
});
