import {
  assertThrows,
  assert,
  assertObjectMatch,
  assertFalse,
  assertEquals,
} from "assert";
import * as t from "./main.ts";

function assertOk<T>(actual: unknown, expected?: T): asserts actual is t.Ok<T> {
  assert(typeof actual === "object");
  assert(actual !== null);
  assert("ok" in actual);
  assert(actual.ok);

  if (typeof expected !== "undefined") {
    assertObjectMatch(actual, { value: expected });
  }
}

function assertErr<E>(
  actual: unknown,
  expected?: E,
): asserts actual is t.Err<E> {
  assert(typeof actual === "object");
  assert(actual !== null);
  assert("ok" in actual);
  assertFalse(actual.ok);

  if (typeof expected !== "undefined") {
    assertObjectMatch(actual, { error: expected });
  }
}

Deno.test("str", () => {
  assertErr(t.str().parse(0), { message: "Expected string" });
  assertErr(t.str("foo").parse(0), { message: "foo" });
  assertOk(t.str().parse("foo"), "foo");
});

Deno.test("num", () => {
  assertErr(t.num().parse("0"), { message: "Expected number" });
  assertErr(t.num("foo").parse("0"), { message: "foo" });
  assertErr(t.num().parse(NaN));
  assertErr(t.num().parse(Infinity));
  assertOk(t.num().parse(0), 0);
});

Deno.test("bool", () => {
  assertErr(t.bool().parse(0), { message: "Expected boolean" });
  assertErr(t.bool("foo").parse(0), { message: "foo" });
  assertOk(t.bool().parse(false), false);
  assertOk(t.bool().parse(true), true);
});

Deno.test("date", () => {
  assertErr(t.date().parse(0), { message: "Expected date" });
  assertErr(t.date("foo").parse(0), { message: "foo" });
  assertErr(t.date().parse(new Date("invalid")), { message: "Expected date" });
  const now = new Date();
  assertOk(t.date().parse(now), now);
});

Deno.test("vec", () => {
  const s = t.vec(t.str());
  assertErr(s.parse({}), { message: "Expected array" });
  assertErr(t.vec(t.str(), "foo").parse({}), { message: "foo" });
  assertErr(s.parse(["0", 1]), { message: "Expected string", path: ["1"] });
  assertOk(s.parse(["0", "1"]), ["0", "1"]);
});

Deno.test("struct", () => {
  const s = t.struct({ id: t.num(), name: t.str() });
  assertErr(s.parse([]), { message: "Expected object" });
  assertErr(s.parse({}), { message: "Expected number", path: ["id"] });
  assertErr(s.parse({ id: 1 }), { message: "Expected string", path: ["name"] });
  assertOk(s.parse({ id: 1, name: "foo" }), { id: 1, name: "foo" });
});

Deno.test("maybe", () => {
  const s = t.maybe(t.str());
  assertOk(s.parse(null), undefined);
  assertOk(s.parse(undefined), undefined);
  assertOk(s.parse("foo"), "foo");
  assertErr(s.parse(1), { message: "Expected string" });
});

Deno.test("withDefault", () => {
  const s = t.withDefault(t.str(), "foo");
  assertOk(s.parse(null), "foo");
  assertOk(s.parse(undefined), "foo");
  assertOk(s.parse("bar"), "bar");
  assertErr(s.parse(1), { message: "Expected string" });
  const a = t.withDefault(t.num(), () => 1);
  assertOk(a.parse(null), 1);
});

Deno.test("either", () => {
  const s = t.either([t.str(), t.num()]);
  assertOk(s.parse("foo"), "foo");
  assertOk(s.parse(0), 0);
  assertErr(s.parse(false), { message: "Expected either string | number" });
  assertErr(t.either([t.str(), t.num()], "foo").parse(false), {
    message: "foo",
  });
});

Deno.test("extend", () => {
  const a = t.struct({ id: t.num() });
  const b = t.struct({ name: t.str() });
  const c = t.extend([a, b]);
  assertErr(c.parse({ id: 1 }), { message: "Expected string", path: ["name"] });
  assertErr(c.parse({ name: "foo" }), {
    message: "Expected number",
    path: ["id"],
  });
  assertOk(c.parse({ id: 1, name: "foo" }), { id: 1, name: "foo" });
});

Deno.test("tuple", () => {
  const s = t.tuple([t.str(), t.num(), t.bool()]);
  assertErr(s.parse({}), { message: "Expected array" });
  assertErr(t.tuple([t.str()], "foo").parse({}), { message: "foo" });
  assertErr(s.parse(["foo", 1, {}]), {
    message: "Expected boolean",
    path: ["2"],
  });
  assertOk(s.parse(["foo", 1, true]), ["foo", 1, true]);
});

Deno.test("pick", () => {
  const a = t.struct({ id: t.num(), name: t.str() });
  const b = t.pick(a, ["name"]);
  assert("name" in b.shape);
  assertFalse("id" in b.shape);
  assertOk(b.parse({ name: "foo" }), { name: "foo" });
});

Deno.test("omit", () => {
  const a = t.struct({ id: t.num(), name: t.str() });
  const b = t.omit(a, ["id"]);
  assert("name" in b.shape);
  assertFalse("id" in b.shape);
  assertOk(b.parse({ name: "foo" }), { name: "foo" });
});

Deno.test("transform", () => {
  const s = t.transform(t.str(), (x) => x.trim().toLowerCase());
  assertOk(s.parse("   FOO   "), "foo");
  assertErr(s.parse(1), { message: "Expected string" });
});

Deno.test("refine", () => {
  const s = t.refine(t.str(), (x) => x.length < 3, "too long");
  assertErr(s.parse("abcde"), { message: "too long" });
  assertOk(s.parse("ab"), "ab");
});

Deno.test("coerce", () => {
  const num = t.coerce(t.num());
  const bool = t.coerce(t.bool());
  const str = t.coerce(t.str());
  const date = t.coerce(t.date());
  assertOk(num.parse("1"), 1);
  assertOk(bool.parse("on"), true);
  assertOk(bool.parse("YES"), true);
  assertOk(bool.parse("true"), true);
  assertOk(str.parse(1), "1");
  assertOk(str.parse(true), "true");
  assertOk(date.parse("2000-01-01"), new Date("2000-01-01"));
  // deno-lint-ignore ban-ts-comment
  // @ts-expect-error
  assertThrows(() => t.coerce(t.struct({ id: t.num() })));
});

Deno.test("unsafeParse", () => {
  const s = t.num();
  assertEquals(t.unsafeParse(s, 10), 10);
  assertThrows(() => t.unsafeParse(s, "foo"));
});

Deno.test("email", () => {
  const s = t.email(t.str());
  assertOk(s.parse("foo@bar.baz"), "foo@bar.baz");
  assertErr(s.parse("foo"), { message: "Expected valid email address" });
  assertErr(s.parse(1), { message: "Expected string" });
});

Deno.test("uuid", () => {
  const s = t.uuid(t.str());
  const uuid = crypto.randomUUID();
  assertOk(s.parse(uuid), uuid);
  assertErr(s.parse("foo"), { message: "Expected valid uuid" });
});

Deno.test("int", () => {
  const s = t.int(t.num());
  assertOk(s.parse(1), 1);
  assertErr(s.parse(1.1), { message: "Expected number to be an integer" });
});

Deno.test("positive", () => {
  const s = t.positive(t.num());
  assertOk(s.parse(1), 1);
  assertErr(s.parse(-1), { message: "Expected number to be positive" });
});

Deno.test("negative", () => {
  const s = t.negative(t.num());
  assertOk(s.parse(-1), -1);
  assertErr(s.parse(1), { message: "Expected number to be negative" });
});

Deno.test("clamp", () => {
  const s = t.clamp(t.num(), 10, 20);
  assertOk(s.parse(15), 15);
  assertOk(s.parse(5), 10);
  assertOk(s.parse(25), 20);
});

Deno.test("min", () => {
  const a = t.min(t.num(), 10);
  const b = t.min(t.str(), 5);
  const c = t.min(t.date(), new Date("2000-01-01"));

  assertOk(a.parse(11), 11);
  assertErr(a.parse(9), { message: "Expected value to be at least 10" });

  assertOk(b.parse("abcde"), "abcde");
  assertErr(b.parse("abc"), { message: "Expected value to be at least 5" });

  assertOk(c.parse(new Date("2000-01-01")), new Date("2000-01-01"));
  assertErr(c.parse(new Date("1999-12-31")), {
    message: `Expected value to be at least ${new Date("2000-01-01")}`,
  });
});

Deno.test("max", () => {
  const a = t.max(t.num(), 10);
  const b = t.max(t.str(), 5);
  const c = t.max(t.date(), new Date("2000-01-01"));

  assertOk(a.parse(10), 10);
  assertErr(a.parse(11), { message: "Expected value to be at most 10" });

  assertOk(b.parse("abcde"), "abcde");
  assertErr(b.parse("abcdef"), { message: "Expected value to be at most 5" });

  assertOk(c.parse(new Date("2000-01-01")), new Date("2000-01-01"));
  assertErr(c.parse(new Date("2000-01-02")), {
    message: `Expected value to be at most ${new Date("2000-01-01")}`,
  });
});

Deno.test("literal", () => {
  assertOk(t.literal("ok").parse("ok"), "ok");
  assertErr(t.literal("foo").parse("bar"), {
    message: "Expected value to be foo",
  });
  assertOk(t.literal(1).parse(1), 1);
  assertErr(t.literal(1).parse(2), {
    message: "Expected value to be 1",
  });
  assertOk(t.literal(false).parse(false), false);
  assertErr(t.literal(false).parse(true), {
    message: "Expected value to be false",
  });
  assertOk(t.literal(null).parse(null), null);
  assertErr(t.literal(null).parse(1), {
    message: "Expected value to be null",
  });
});

Deno.test("trim", () => {
  const s = t.trim(t.str());
  assertOk(s.parse("  hello  "), "hello");
});

Deno.test("lower", () => {
  const s = t.lower(t.str());
  assertOk(s.parse("HELLO"), "hello");
});

Deno.test("upper", () => {
  const s = t.upper(t.str());
  assertOk(s.parse("hello"), "HELLO");
});
