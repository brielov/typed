import { asNumber, number } from "../number";
import { expectErr, expectOk } from "../../test-util";

describe(".number()", () => {
  const struct = number("test");

  it("returns ok if the input is a number", () => expectOk(struct(1), 1));

  it("returns err if the input is not a valid number", () =>
    expectErr(struct(NaN), "test", { input: NaN, path: [] }));

  it("returns err if the input is not a number", () =>
    expectErr(struct("hello"), "test", { input: "hello", path: [] }));
});

describe(".asNumber()", () => {
  const struct = asNumber("test");

  it("returns ok if the input is convertable to a number", () =>
    expectOk(struct("1"), 1));
});
