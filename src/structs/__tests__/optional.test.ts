import { number } from "../number";
import { optional } from "../optional";

describe(".optional()", () => {
  const struct = optional(number("test"));

  it("returns ok if the input is undefined", () => {
    expect(struct(undefined)).toBeOk(undefined);
  });

  it("returns ok if the input is a number", () => {
    expect(struct(1)).toBeOk(1);
  });

  it("returns err if the input is not undefined or a number", () => {
    expect(struct("hello")).toBeErr("test", { input: "hello", path: [] });
  });
});
