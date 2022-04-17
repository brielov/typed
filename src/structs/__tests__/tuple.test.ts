import { number } from "../number";
import { string } from "../string";
import { tuple } from "../tuple";

describe(".tuple()", () => {
  const struct = tuple([string(), number("number test")], "test");

  it("has default error", () => {
    const struct = tuple([string(), number("number test")]);
    expect(struct(null)).toBeErr("Expecting tuple");
  });

  it("returns ok if the input is an array", () => {
    expect(struct(["hello", 1])).toBeOk(["hello", 1]);
  });

  it("returns err if the input is not an array", () => {
    expect(struct(1)).toBeErr("test", { input: 1, path: [] });
  });

  it("returns err if the input is an array with an invalid element", () => {
    expect(struct(["hello", {}])).toBeErr("number test", {
      input: {},
      path: ["1"],
    });
  });
});
