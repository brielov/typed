import { asString, string } from "../string";
import { expectErr, expectOk } from "../../test-util";

const struct = string("test");

describe(".string()", () => {
  it("returns ok if the input is a string", () =>
    expectOk(struct("hello"), "hello"));

  it("returns err if the input is not a string", () =>
    expectErr(struct(1), "test", { input: 1, path: [] }));
});

describe(".asString()", () => {
  it("converts the input to a string", () => expectOk(asString()(1), "1"));
});
