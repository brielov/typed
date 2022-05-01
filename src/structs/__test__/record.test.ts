import { expectErr, expectOk } from "../../test-util";
import { literal } from "../literal";
import { number } from "../number";
import { record } from "../record";
import { string } from "../string";

const struct = record(string(), number("number test"), "test");

it("has default error", () => {
  const struct = record(string(), number("number test"));
  expectErr(struct(null), "Expecting object");
});

it("returns ok if the input is an object", () =>
  expectOk(struct({ a: 1, b: 2 }), { a: 1, b: 2 }));

it("returns err if the input is not an object", () =>
  expectErr(struct(1), "test", { input: 1, path: [] }));

it("returns err if input key is not the same as struct", () => {
  const struct = record(
    literal("foo", "foo test"),
    number("number test"),
    "test",
  );

  expectErr(struct({ foo: 1, bar: 2 }), "foo test", {
    input: "bar",
    path: ["bar"],
  });
});

it("returns err if a property is invalid", () =>
  expectErr(struct({ a: 1, b: "2" }), "number test", {
    input: "2",
    path: ["b"],
  }));
