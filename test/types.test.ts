import { assertEquals } from "https://deno.land/std@0.123.0/testing/asserts.ts";

import * as T from "../src/types.ts";
import { err, ok, toErr, toMismatchMsg } from "../src/util.ts";

Deno.test("string - succeeds when input is string", () =>
  assertEquals(T.string("foo"), ok("foo"))
);

Deno.test("string - fails when input ain't string", () =>
  assertEquals(T.string(1), err(toErr(toMismatchMsg("string", "number"))))
);

Deno.test("number - succeeds when input is number", () =>
  assertEquals(T.number(1), ok(1))
);

Deno.test("number - fails when input ain't number", () =>
  assertEquals(T.number("foo"), err(toErr(toMismatchMsg("number", "string"))))
);

Deno.test("number - fails when input ain't finite", () =>
  assertEquals(
    T.number(NaN),
    err(toErr("Expecting value to be a finite 'number'."))
  )
);

Deno.test("boolean - succeeds when input is boolean", () =>
  assertEquals(T.boolean(false), ok(false))
);

Deno.test("boolean - fails when input ain't boolean", () =>
  assertEquals(T.boolean(1), err(toErr(toMismatchMsg("boolean", "number"))))
);

Deno.test("date - succeeds when input is date", () => {
  const d = new Date();
  assertEquals(T.date(d), ok(d));
});

Deno.test("date - fails when input ain't Date", () =>
  assertEquals(T.date(1), err(toErr(toMismatchMsg("date", "number"))))
);

Deno.test("date - fails when date ain't valid", () =>
  assertEquals(
    T.date(new Date("invalid")),
    err(toErr("Expecting date to be valid."))
  )
);

Deno.test("regex - succeeds when input matches expression", () =>
  assertEquals(T.regex(/\.ts$/)("hello.ts"), ok("hello.ts"))
);

Deno.test("regex - fails when input doesn't match expression", () => {
  const r = /\.ts$/;
  assertEquals(
    T.regex(r)("hello.js"),
    err(toErr(`Expecting value to match '${r}'.`))
  );
});

Deno.test("array - succeeds when all items succeed", () =>
  assertEquals(T.array(T.number)([1, 2, 3]), ok([1, 2, 3]))
);

Deno.test("array - fails when input ain't array", () =>
  assertEquals(
    T.array(T.string)({}),
    err(toErr(toMismatchMsg("array", "object")))
  )
);

Deno.test("array - fails when one or more items fail", () =>
  assertEquals(
    T.array(T.number)([1, 2, false, 3]),
    err(toErr(toMismatchMsg("number", "boolean"), ["2"]))
  )
);

Deno.test("object - succeeds when all props succeed", () => {
  const t = T.object({ name: T.string, age: T.number });
  assertEquals(t({ name: "john", age: 30 }), ok({ name: "john", age: 30 }));
});

Deno.test("object - fails when input ain't object", () => {
  const t = T.object({ name: T.string, age: T.number });
  assertEquals(t([]), err(toErr(toMismatchMsg("object", "array"))));
});

Deno.test("object - fails when one or more props fail", () => {
  const t = T.object({ name: T.string, age: T.number });
  assertEquals(
    t({ name: "john" }),
    err(toErr(toMismatchMsg("number", "undefined"), ["age"]))
  );
});

Deno.test("object - removes extra props", () => {
  const t = T.object({ name: T.string });
  assertEquals(t({ name: "john", age: 30 }), ok({ name: "john" }));
});

Deno.test("record - succeeds when all props succeed", () => {
  const t = T.record(T.string, T.object({ age: T.number }));
  const actual = t({ john: { age: 30 }, jane: { age: 31 } });
  assertEquals(actual, ok({ john: { age: 30 }, jane: { age: 31 } }));
});

Deno.test("record - fails when input ain't object", () => {
  const t = T.record(T.string, T.object({ age: T.number }));
  assertEquals(t([]), err(toErr(toMismatchMsg("object", "array"))));
});

Deno.test("record - fails when one or more keys fail", () => {
  const t = T.record(T.literal("john"), T.object({ age: T.number }));
  const actual = t({ jane: { age: 31 } });
  assertEquals(
    actual,
    err(toErr("Expecting literal 'john'. Got 'jane'.", ["jane"]))
  );
});

Deno.test("record - fails when one or more props fail", () => {
  const t = T.record(T.string, T.object({ name: T.string }));
  const actual = t({ john: { name: "john" }, jane: { age: 21 } });
  assertEquals(
    actual,
    err(toErr(toMismatchMsg("string", "undefined"), ["jane", "name"]))
  );
});

Deno.test("record - removes extra props", () => {
  const t = T.record(T.string, T.object({ name: T.string }));
  const actual = t({ john: { name: "john", age: 30 } });
  assertEquals(actual, ok({ john: { name: "john" } }));
});

Deno.test("literal - succeeds when input equals constant", () =>
  assertEquals(T.literal("foo")("foo"), ok("foo"))
);

Deno.test("literal - fails when input ain't equal to constant", () =>
  assertEquals(
    T.literal("foo")("bar"),
    err(toErr("Expecting literal 'foo'. Got 'bar'."))
  )
);

Deno.test("nullable - succeeds with null input", () =>
  assertEquals(T.nullable(T.number)(null), ok(null))
);

Deno.test("nullable - succeeds when base type succeeds", () =>
  assertEquals(T.nullable(T.number)(1), ok(1))
);

Deno.test("nullable - fails when base type fails", () =>
  assertEquals(
    T.nullable(T.number)(""),
    err(toErr(toMismatchMsg("number", "string")))
  )
);

Deno.test("optional - succeeds with undefined input", () =>
  assertEquals(T.optional(T.string)(undefined), ok(undefined))
);

Deno.test("optional - succeeds when base type succeeds", () =>
  assertEquals(T.optional(T.string)("foo"), ok("foo"))
);

Deno.test("optional - fails when base type fails", () =>
  assertEquals(
    T.optional(T.string)(1),
    err(toErr(toMismatchMsg("string", "number")))
  )
);

Deno.test("defaulted - succeeds when base type succeeds", () =>
  assertEquals(T.defaulted(T.number, 10)(1), ok(1))
);

Deno.test("defaulted - succeeds whith undefined input", () =>
  assertEquals(T.defaulted(T.number, 10)(undefined), ok(10))
);

Deno.test("defaulted - fails when base type fails", () =>
  assertEquals(
    T.defaulted(T.number, 10)(""),
    err(toErr(toMismatchMsg("number", "string")))
  )
);

Deno.test("enums - succeeds when input matches enum", () => {
  enum Role {
    admin,
    user,
  }

  const type = T.enums(Role);
  assertEquals(type(Role.admin), ok(Role.admin));
});

Deno.test("enums - fails when input doesn't match enum", () => {
  enum Role {
    admin,
    user,
  }

  const type = T.enums(Role);
  assertEquals(
    type("guest"),
    err(
      toErr(
        `Expecting value to be one of '${Object.values(Role).join(
          ", "
        )}'. Got 'guest'.`
      )
    )
  );
});

Deno.test("tuple - succeeds when all items succeed", () => {
  const t = T.tuple(T.number, T.string, T.boolean);
  assertEquals(t([1, "foo", false]), ok([1, "foo", false]));
});

Deno.test("tuple - fails when input ain't array", () => {
  const t = T.tuple(T.number, T.string, T.boolean);
  assertEquals(t({}), err(toErr(toMismatchMsg("array", "object"))));
});

Deno.test("tuple - fails when input has less items than base type", () => {
  const type = T.tuple(T.number, T.string, T.boolean);
  assertEquals(
    type([1, "foo"]),
    err(toErr(toMismatchMsg("boolean", "undefined"), ["2"]))
  );
});

Deno.test("tuple - removes extra items", () => {
  const type = T.tuple(T.number, T.string, T.boolean);
  assertEquals(type([1, "foo", false, {}, new Date()]), ok([1, "foo", false]));
});

Deno.test("union - succeeds when all items succeed", () => {
  const type = T.union(T.number, T.string, T.boolean);
  for (const val of [1, "foo", false]) {
    assertEquals(type(val), ok(val));
  }
});

Deno.test("union - fails when no base type matches input", () => {
  const type = T.union(T.number, T.string, T.boolean);
  assertEquals(
    type({}),
    err(
      toErr(toMismatchMsg("number", "object")),
      toErr(toMismatchMsg("string", "object")),
      toErr(toMismatchMsg("boolean", "object"))
    )
  );
});

Deno.test("intersection - succeeds when all types succeed", () => {
  const a = T.object({ a: T.string });
  const b = T.object({ b: T.number });
  const type = T.intersection(a, b);
  assertEquals(type({ a: "foo", b: 10 }), ok({ a: "foo", b: 10 }));
});

Deno.test("intersection - fails when any type fails", () => {
  const a = T.object({ a: T.string });
  const b = T.object({ b: T.number });
  const type = T.intersection(a, b);
  assertEquals(
    type({ a: "foo" }),
    err(toErr(toMismatchMsg("number", "undefined"), ["b"]))
  );
});

Deno.test("intersection - handles optional values", () => {
  const a = T.object({ a: T.string });
  const b = T.object({ b: T.number });
  const c = T.object({ c: T.optional(T.boolean) });
  const type = T.intersection(a, b, c);
  assertEquals(type({ a: "foo", b: 10 }), ok({ a: "foo", b: 10 }));
});

for (const val of ["", 1, false, [], {}, null, undefined]) {
  Deno.test("any - always return its input", () =>
    assertEquals(T.any(val), ok(val))
  );
}

Deno.test("asString - coerces input to string", () =>
  assertEquals(T.asString(1), ok("1"))
);

Deno.test("asNumber - coerces input to number", () =>
  assertEquals(T.asNumber("1"), ok(1))
);

Deno.test("asDate - coerces input to date when number", () => {
  const date = new Date();
  assertEquals(T.asDate(date.getTime()), ok(date));
});

Deno.test("asDate - coerces input to date when string", () => {
  const date = new Date();
  assertEquals(T.asDate(date.toISOString()), ok(date));
});
