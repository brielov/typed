import { literal } from "../literal";
import { number } from "../number";
import { record } from "../record";
import { string } from "../string";

describe(".record()", () => {
  const struct = record(string(), number("number test"), "test");

  it("has default error", () => {
    const struct = record(string(), number("number test"));
    expect(struct(null)).toBeErr("Expecting object");
  });

  it("returns ok if the input is an object", () => {
    expect(struct({ a: 1, b: 2 })).toBeOk({ a: 1, b: 2 });
  });

  it("returns err if the input is not an object", () => {
    expect(struct(1)).toBeErr("test", { input: 1, path: [] });
  });

  it("returns err if input key is not the same as struct", () => {
    const struct = record(
      literal("foo", "foo test"),
      number("number test"),
      "test",
    );

    expect(struct({ foo: 1, bar: 2 })).toBeErr("foo test", {
      input: "bar",
      path: ["bar"],
    });
  });

  it("returns err if a property is invalid", () => {
    expect(struct({ a: 1, b: "2" })).toBeErr("number test", {
      input: "2",
      path: ["b"],
    });
  });
});
