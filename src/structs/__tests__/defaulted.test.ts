import { defaulted } from "../defaulted";
import { number } from "../number";

describe(".defaulted()", () => {
  it("returns err if the input is not the same struct", () => {
    const struct = defaulted(number("test"), 10);
    expect(struct("5")).toBeErr("test", { input: "5", path: [] });
  });

  it("returns the default value if the input is undefined", () => {
    const struct = defaulted(number("test"), 10);
    expect(struct(undefined)).toBeOk(10);
  });

  it("returns the input if the input is defined", () => {
    const struct = defaulted(number("test"), 10);
    expect(struct(5)).toBeOk(5);
  });
});
