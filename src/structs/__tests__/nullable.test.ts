import { nullable } from "../nullable";
import { number } from "../number";

describe(".nullable()", () => {
  const struct = nullable(number("test"));

  it("returns ok if the input is null", () => {
    expect(struct(null)).toBeOk(null);
  });

  it("returns ok if the input is a number", () => {
    expect(struct(1)).toBeOk(1);
  });

  it("returns err if the input is not null or a number", () => {
    expect(struct("hello")).toBeErr("test", { input: "hello", path: [] });
  });
});
