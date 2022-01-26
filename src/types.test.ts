import * as T from "./types";
import { toErr } from "./util";

describe(".string()", () => {
  it("returns `Success` when input is a string", () => {
    const res = T.string("abc") as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual("abc");
  });

  it("returns `Failure` when input is not a string", () => {
    const res = T.string(1) as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([
      toErr("Expecting type 'string'. Got type 'number'."),
    ]);
  });
});

describe(".number()", () => {
  it("returns `Success` when input is a number", () => {
    const res = T.number(1) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual(1);
  });

  it("returns `Failure` when input is not a number", () => {
    const res = T.number("abc") as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([
      toErr("Expecting type 'number'. Got type 'string'."),
    ]);
  });

  it("returns `Failure` when input is not a finite number", () => {
    const res = T.number(NaN) as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([
      toErr("Expecting value to be a finite 'number'."),
    ]);
  });
});

describe(".boolean()", () => {
  it("returns `Success` when input is a boolean", () => {
    const res = T.boolean(false) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual(false);
  });

  it("returns `Failure` when input is not a boolean", () => {
    const res = T.boolean(1) as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([
      toErr("Expecting type 'boolean'. Got type 'number'."),
    ]);
  });
});

describe(".date()", () => {
  it("returns `Success` when input is a Date", () => {
    const d = new Date();
    const res = T.date(d) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual(d);
  });

  it("returns `Failure` when input is not a Date", () => {
    const res = T.date(false) as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([
      toErr("Expecting type 'date'. Got type 'boolean'."),
    ]);
  });

  it("returns `Failure` when date is invalid", () => {
    const res = T.date(new Date("invalid")) as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([toErr("Expecting date to be valid.")]);
  });
});

describe(".regex()", () => {
  const r = /\.ts$/;

  it("returns `Success` when input matches the expression", () => {
    const res = T.regex(r)("hello.ts") as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual("hello.ts");
  });

  it("returns `Failure` when input does not match the expression", () => {
    const res = T.regex(r)("hello.js") as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([toErr(`Expecting value to match '${r}'.`)]);
  });
});

describe(".array()", () => {
  it("returns `Success` when all items return `Ok`", () => {
    const res = T.array(T.number)([1, 2, 3]) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual([1, 2, 3]);
  });

  it("returns `Failure` when input is not an array", () => {
    const res = T.array(T.string)({}) as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([
      toErr("Expecting type 'array'. Got type 'object'."),
    ]);
  });

  it("returns `Failure` when one or more items return `Err`", () => {
    const res = T.array(T.number)([1, 2, false, 3]) as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([
      toErr("Expecting type 'number'. Got type 'boolean'.", ["2"]),
    ]);
  });
});

describe(".object()", () => {
  const type = T.object({ name: T.string, age: T.number });

  it("returns `Success` when all properties return `Ok`", () => {
    const res = type({ name: "John", age: 30 }) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual({ name: "John", age: 30 });
  });

  it("returns `Failure` when input is not an object", () => {
    const res = type([]) as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([
      toErr("Expecting type 'object'. Got type 'array'."),
    ]);
  });

  it("returns `Failure` when one or more properties return `Failure`", () => {
    const res = type({ age: 30 }) as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([
      toErr("Expecting type 'string'. Got type 'undefined'.", ["name"]),
    ]);
  });

  it("removes all properties which are not specified in shape", () => {
    const res = type({
      name: "John",
      age: 30,
      email: "john@doe.com",
      role: "user",
    }) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual({ name: "John", age: 30 });
  });
});

describe(".record()", () => {
  const type = T.record(T.string, T.object({ name: T.string }));

  it("returns `Success` when all properties return `Ok`", () => {
    const res = type({ john: { name: "john" }, jane: { name: "jane" } }) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual({
      john: { name: "john" },
      jane: { name: "jane" },
    });
  });

  it("returns `Failure` when input is not an object", () => {
    const res = type([]) as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([
      toErr("Expecting type 'object'. Got type 'array'."),
    ]);
  });

  it("returns `Failure` when one or more properties return `Failure`", () => {
    const res = type({ john: { name: "john" }, jane: { age: 21 } }) as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([
      toErr("Expecting type 'string'. Got type 'undefined'.", ["jane", "name"]),
    ]);
  });

  it("removes all properties which are not specified in shape", () => {
    const res = type({ john: { name: "john", age: 30 } }) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual({ john: { name: "john" } });
  });
});

describe(".literal()", () => {
  it("returns `Success` when input is equal to constant", () => {
    const res = T.literal("hello")("hello") as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual("hello");
  });

  it("returns `Failure` when input is not equal to constant", () => {
    const res = T.literal("hello")("bye") as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([
      toErr("Expecting literal 'hello'. Got 'bye'."),
    ]);
  });
});

describe(".nullable()", () => {
  const type = T.nullable(T.number);

  it("returns `Success` when input is null", () => {
    const res = type(null) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual(null);
  });

  it("returns `Success` when the base type returns `Success`", () => {
    const res = type(3) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual(3);
  });

  it("returns `Failure` when input is not null or base type returns `Failure`", () => {
    const res = type("hello") as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([
      toErr("Expecting type 'number'. Got type 'string'."),
    ]);
  });
});

describe(".optional()", () => {
  const type = T.optional(T.number);

  it("returns `Success` when input is undefined", () => {
    const res = type(void 0) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual(void 0);
  });

  it("returns `Success` when the base type returns `Success`", () => {
    const res = type(3) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual(3);
  });

  it("returns `Failure` when input is not undefined or base type returns `Failure`", () => {
    const res = type("hello") as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([
      toErr("Expecting type 'number'. Got type 'string'."),
    ]);
  });
});

describe(".defaulted()", () => {
  const type = T.defaulted(T.number, 10);

  it("returns `Success` when base type returns `Success`", () => {
    const res = type(1) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual(1);
  });

  it("returns `Success` with default value when input is undefined", () => {
    const res = type(void 0) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual(10);
  });

  it("returns `Failure` when base type returns `Failure`", () => {
    const res = type("3") as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([
      toErr("Expecting type 'number'. Got type 'string'."),
    ]);
  });
});

describe(".enums()", () => {
  enum Role {
    admin,
    user,
  }

  const type = T.enums(Role);

  it("returns `Success` when input matches enum", () => {
    const res = type(Role.admin) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual(Role.admin);
  });

  it("returns `Failure` when input does not match enum", () => {
    const res = type("whatever") as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([
      toErr(
        `Expecting value to be one of '${Object.values(Role).join(
          ", ",
        )}'. Got 'whatever'.`,
      ),
    ]);
  });
});

describe(".tuple()", () => {
  const type = T.tuple(T.number, T.string, T.boolean);

  it("returns `Success` when all items return `Success`", () => {
    const res = type([1, "hello", true]) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual([1, "hello", true]);
  });

  it("returns `Failure` when input is not an array", () => {
    const res = type({}) as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([
      toErr("Expecting type 'array'. Got type 'object'."),
    ]);
  });

  it("returns `Failure` when input has less items than the base type", () => {
    const res = type([1, "hello"]) as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([
      toErr("Expecting type 'boolean'. Got type 'undefined'.", ["2"]),
    ]);
  });

  it("discards extra items", () => {
    const res = type([1, "hello", true, {}, []]) as any;
    expect(res.ok).toEqual(true);
    expect(res.data.length).toEqual(3);
  });

  it("can be tuple in tuple", () => {
    const type = T.tuple(
      T.tuple(T.number, T.number),
      T.string,
      T.boolean,
    ) as any;
    const res = type([[1, 2], "hello", true]);
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual([[1, 2], "hello", true]);
  });
});

describe(".union()", () => {
  const type = T.union(T.number, T.string, T.boolean);

  it("returns `Success` when all items return `Success`", () => {
    for (const val of [1, "hello", true]) {
      const res = type(val) as any;
      expect(res.ok).toEqual(true);
      expect(res.data).toEqual(val);
    }
  });

  it("returns `Failure` when no item matches base types", () => {
    const res = type({}) as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([
      toErr("Expecting type 'number'. Got type 'object'."),
      toErr("Expecting type 'string'. Got type 'object'."),
      toErr("Expecting type 'boolean'. Got type 'object'."),
    ]);
  });
});

describe(".intersection()", () => {
  const a = T.object({ a: T.string });
  const b = T.object({ b: T.number });
  const type = T.intersection(a, b);

  it("returns `Success` when all types return `Success`", () => {
    const res = type({ a: "hello", b: 10 }) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual({ a: "hello", b: 10 });
  });

  it("returns `Failure` when any type returns `Failure`", () => {
    const res = type({ a: "hello" }) as any;
    expect(res.ok).toEqual(false);
    expect(res.errors).toEqual([
      toErr("Expecting type 'number'. Got type 'undefined'.", ["b"]),
    ]);
  });

  it("handles optional values", () => {
    const c = T.object({ c: T.optional(T.boolean) });
    const res = T.intersection(a, b, c)({ a: "hello", b: 10 }) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual({ a: "hello", b: 10 });
  });
});

describe.each(["", 1, false, [], {}, null, undefined])(
  ".any(%s) returns `Success`",
  (value) => {
    const res = T.any(value) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual(value);
  },
);

describe(".asString()", () => {
  it("coerces value to a string", () => {
    const res = T.asString(1) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual("1");
  });
});

describe(".asNumber()", () => {
  it("coerces value to a number", () => {
    const res = T.asNumber("10") as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual(10);
  });
});

describe(".asDate()", () => {
  it("coerces value to a date", () => {
    const date = new Date("2021-10-22");
    let res = T.asDate(date.toISOString()) as any;
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual(date);

    res = T.asDate(date.getTime());
    expect(res.ok).toEqual(true);
    expect(res.data).toEqual(date);
  });
});
