import { asNumber, number } from "../number";

describe(".number()", () => {
  const struct = number("test");

  it("returns ok if the input is a number", () => expect(struct(1)).toBeOk(1));

  it("returns err if the input is not a valid number", () =>
    expect(struct(NaN)).toBeErr("test", { input: NaN, path: [] }));

  it("returns err if the input is not a number", () =>
    expect(struct("hello")).toBeErr("test", { input: "hello", path: [] }));
});

describe(".asNumber()", () => {
  const struct = asNumber("test");

  it("returns ok if the input is convertable to a number", () =>
    expect(struct("1")).toBeOk(1));
});
