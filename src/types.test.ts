import * as T from "./types";
import { toErr } from "./util";

describe(".string()", () => {
  it("returns `Ok` when input is a string", () => {
    const res = T.string("abc");
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual("abc");
  });

  it("returns `Err` when input is not a string", () => {
    const res = T.string(1);
    expect(res.isErr()).toEqual(true);
    expect(res.unwrapErr()).toEqual(
      toErr("Expecting type 'string'. Got type 'number'."),
    );
  });
});

describe(".number()", () => {
  it("returns `Ok` when input is a number", () => {
    const res = T.number(1);
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual(1);
  });

  it("returns `Err` when input is not a number", () => {
    const res = T.number("abc");
    expect(res.isErr()).toEqual(true);
    expect(res.unwrapErr().message).toEqual(
      "Expecting type 'number'. Got type 'string'.",
    );
  });

  it("returns `Err` when input is not a finite number", () => {
    const res = T.number(NaN);
    expect(res.isErr()).toEqual(true);
    expect(res.unwrapErr().message).toEqual(
      "Expecting value to be a finite 'number'.",
    );
  });
});

describe(".boolean()", () => {
  it("returns `Ok` when input is a boolean", () => {
    const res = T.boolean(false);
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual(false);
  });

  it("returns `Err` when input is not a boolean", () => {
    const res = T.boolean(1);
    expect(res.isErr()).toEqual(true);
    expect(res.unwrapErr().message).toEqual(
      "Expecting type 'boolean'. Got type 'number'.",
    );
  });
});

describe(".date()", () => {
  it("returns `Ok` when input is a Date", () => {
    const d = new Date();
    const res = T.date(d);
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual(d);
  });

  it("returns `Err` when input is not a Date", () => {
    const res = T.date(false);
    expect(res.isErr()).toEqual(true);
    expect(res.unwrapErr().message).toEqual(
      "Expecting type 'date'. Got type 'boolean'.",
    );
  });

  it("returns `Err` when date is invalid", () => {
    const res = T.date(new Date("invalid"));
    expect(res.isErr()).toEqual(true);
    expect(res.unwrapErr().message).toEqual(
      "Expecting value to be a valid 'date'.",
    );
  });
});

describe(".regex()", () => {
  const r = /\.ts$/;

  it("returns `Ok` when input matches the expression", () => {
    const res = T.regex(r)("hello.ts");
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual("hello.ts");
  });

  it("returns `Err` when input does not match the expression", () => {
    const res = T.regex(r)("hello.js");
    expect(res.isErr()).toEqual(true);
    expect(res.unwrapErr().message).toEqual(`Expecting value to match '${r}'.`);
  });
});

describe(".array()", () => {
  it("returns `Ok` when all items return `Ok`", () => {
    const res = T.array(T.number)([1, 2, 3]);
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual([1, 2, 3]);
  });

  it("returns `Err` when input is not an array", () => {
    const res = T.array(T.string)({});
    expect(res.isErr()).toEqual(true);
    expect(res.unwrapErr()).toEqual(
      toErr("Expecting type 'array'. Got type 'object'."),
    );
  });

  it("returns `Err` when one or more items return `Err`", () => {
    const res = T.array(T.number)([1, 2, false, 3]);
    expect(res.isErr()).toEqual(true);
    const err = res.unwrapErr();
    expect(err).toBeInstanceOf(AggregateError);
    expect(
      (err as any).errors.map((err: any) => [err.message, err.path]),
    ).toEqual([["Expecting type 'number'. Got type 'boolean'.", ["2"]]]);
  });
});

describe(".object()", () => {
  const type = T.object({ name: T.string, age: T.number });

  it("returns `Ok` when all properties return `Ok`", () => {
    const res = type({ name: "John", age: 30 });
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual({ name: "John", age: 30 });
  });

  it("returns `Err` when input is not an object", () => {
    const res = type([]);
    expect(res.isErr()).toEqual(true);
    expect(res.unwrapErr()).toEqual(
      toErr("Expecting type 'object'. Got type 'array'."),
    );
  });

  it("returns `Err` when one or more properties return `Err`", () => {
    const res = type({ age: 30 });
    expect(res.isErr()).toEqual(true);
    expect(res.unwrapErr()).toEqual(
      toErr("Expecting type 'string'. Got type 'undefined'."),
    );
  });

  it("removes all properties which are not specified in shape", () => {
    const res = type({
      name: "John",
      age: 30,
      email: "john@doe.com",
      role: "user",
    });
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual({ name: "John", age: 30 });
  });
});

describe(".literal()", () => {
  it("returns `Ok` when input is equal to constant", () => {
    const res = T.literal("hello")("hello");
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual("hello");
  });

  it("returns `Err` when input is not equal to constant", () => {
    const res = T.literal("hello")("bye");
    expect(res.isErr()).toEqual(true);
    expect(res.unwrapErr()).toEqual(
      toErr("Expecting literal 'hello'. Got 'bye'."),
    );
  });
});

describe(".nullable()", () => {
  const type = T.nullable(T.number);

  it("returns `Ok` when input is null", () => {
    const res = type(null);
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual(null);
  });

  it("returns `Ok` when the base type returns `Ok`", () => {
    const res = type(3);
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual(3);
  });

  it("returns `Err` when input is not null or base type returns `Err`", () => {
    const res = type("hello");
    expect(res.isErr()).toEqual(true);
    expect(res.unwrapErr()).toEqual(
      toErr("Expecting type 'number'. Got type 'string'."),
    );
  });
});

describe(".optional()", () => {
  const type = T.optional(T.number);

  it("returns `Ok` when input is undefined", () => {
    const res = type(void 0);
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual(void 0);
  });

  it("returns `Ok` when the base type returns `Ok`", () => {
    const res = type(3);
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual(3);
  });

  it("returns `Err` when input is not undefined or base type returns `Err`", () => {
    const res = type("hello");
    expect(res.isErr()).toEqual(true);
    expect(res.unwrapErr()).toEqual(
      toErr("Expecting type 'number'. Got type 'string'."),
    );
  });
});

describe(".defaulted()", () => {
  const type = T.defaulted(T.number, 10);

  it("returns `Ok` when base type returns `Ok`", () => {
    const res = type(1);
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual(1);
  });

  it("returns `Ok` with default value when input is undefined", () => {
    const res = type(void 0);
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual(10);
  });

  it("returns `Err` when base type returns `Err`", () => {
    const res = type("3");
    expect(res.isErr()).toEqual(true);
    expect(res.unwrapErr()).toEqual(
      toErr("Expecting type 'number'. Got type 'string'."),
    );
  });
});

describe(".enums()", () => {
  enum Role {
    admin,
    user,
  }

  const type = T.enums(Role);

  it("returns `Ok` when input matches enum", () => {
    const res = type(Role.admin);
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual(Role.admin);
  });

  it("returns `Err` when input does not match enum", () => {
    const res = type("whatever");
    expect(res.isErr()).toEqual(true);
    expect(res.unwrapErr()).toEqual(
      toErr(
        `Expecting value to be one of '${Object.values(Role).join(
          ", ",
        )}'. Got 'whatever'.`,
      ),
    );
  });
});

describe(".tuple()", () => {
  const type = T.tuple(T.number, T.string, T.boolean);

  it("returns `Ok` when all items return `Ok`", () => {
    const res = type([1, "hello", true]);
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual([1, "hello", true]);
  });

  it("returns `Err` when input is not an array", () => {
    const res = type({});
    expect(res.isErr()).toEqual(true);
    expect(res.unwrapErr()).toEqual(
      toErr("Expecting type 'array'. Got type 'object'."),
    );
  });

  it("returns `Err` when input has less items than the base type", () => {
    const res = type([1, "hello"]);
    expect(res.isErr()).toEqual(true);
    expect(res.unwrapErr()).toEqual(
      toErr("Expecting type 'boolean'. Got type 'undefined'."),
    );
  });

  it("discards extra items", () => {
    const res = type([1, "hello", true, {}, []]);
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap().length).toEqual(3);
  });

  it("can be tuple in tuple", () => {
    const type = T.tuple(T.tuple(T.number, T.number), T.string, T.boolean);
    const res = type([[1, 2], "hello", true]);
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual([[1, 2], "hello", true]);
  });
});

describe(".union()", () => {
  const type = T.union(T.number, T.string, T.boolean);

  it("returns `Ok` when all items return `Ok`", () => {
    for (const val of [1, "hello", true]) {
      const res = type(val);
      expect(res.isOk()).toEqual(true);
      expect(res.unwrap()).toEqual(val);
    }
  });

  it("returns `Err` when no item matches base types", () => {
    const res = type({});
    expect(res.isErr()).toEqual(true);
    expect(res.unwrapErr().message).toEqual(
      [
        "Expecting type 'number'. Got type 'object'.",
        "Expecting type 'string'. Got type 'object'.",
        "Expecting type 'boolean'. Got type 'object'.",
      ].join("\n"),
    );
  });
});

describe(".intersection()", () => {
  const a = T.object({ a: T.string });
  const b = T.object({ b: T.number });
  const type = T.intersection(a, b);

  it("returns `Ok` when all types return `Ok`", () => {
    const res = type({ a: "hello", b: 10 });
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual({ a: "hello", b: 10 });
  });

  it("returns `Err` when any type returns `Err`", () => {
    const res = type({ a: "hello" });
    expect(res.isErr()).toEqual(true);
    expect(res.unwrapErr()).toEqual(
      toErr("Expecting type 'number'. Got type 'undefined'."),
    );
  });

  it("handles optional values", () => {
    const c = T.object({ c: T.optional(T.boolean) });
    const res = T.intersection(a, b, c)({ a: "hello", b: 10 });
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual({ a: "hello", b: 10 });
  });
});

describe.each(["", 1, false, [], {}, null, undefined])(
  `.any(%s) returns success`,
  (value) => {
    const res = T.any(value);
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual(value);
  },
);

describe(".asString()", () => {
  it("coerces value to a string", () => {
    const res = T.asString(1);
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual("1");
  });
});

describe(".asNumber()", () => {
  it("coerces value to a number", () => {
    const res = T.asNumber("10");
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual(10);
  });
});

describe(".asDate()", () => {
  it("coerces value to a date", () => {
    const date = new Date("2021-10-22");
    let res = T.asDate(date.toISOString());
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual(date);

    res = T.asDate(date.getTime());
    expect(res.isOk()).toEqual(true);
    expect(res.unwrap()).toEqual(date);
  });
});
