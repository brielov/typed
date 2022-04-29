import { number } from "../number";
import { string } from "../string";
import { union } from "../union";

describe(".union()", () => {
  const struct = union([string("string test"), number("number test")]);

  it("returns err if no union matches", () => {
    expect(struct([])).toBeErr("Expecting one of the specified structs");
  });

  it("returns ok if the input is a string", () =>
    expect(struct("hello")).toBeOk("hello"));

  it("returns ok if the input is a number", () => expect(struct(1)).toBeOk(1));

  it("returns err if the input is not a string or number", () => {
    expect(struct(true)).toBeErr("Expecting one of the specified structs", {
      input: true,
      path: [],
    });
    expect(struct({})).toBeErr("Expecting one of the specified structs", {
      input: {},
      path: [],
    });
  });
});
