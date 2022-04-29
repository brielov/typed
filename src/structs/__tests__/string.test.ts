import { asString, string } from "../string";

describe(".string()", () => {
  it("returns ok if the input is a string", () =>
    expect(string()("hello")).toBeOk("hello"));

  it("returns err if the input is not a string", () =>
    expect(string("test")(1)).toBeErr("test", { input: 1, path: [] }));
});

describe(".asString()", () => {
  it("converts the input to a string", () => expect(asString()(1)).toBeOk("1"));
});
