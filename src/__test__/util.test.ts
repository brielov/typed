import { chain, map, ok, unwrap, unwrapOr } from "../util";
import { expectErr, expectOk } from "../test-util";
import { string } from "../structs/string";

describe(".map()", () => {
  const struct = map(string("string test"), (str) => ok(Number(str)));

  it("should return a valid result for a valid input", () =>
    expectOk(struct("1"), 1));

  it("should return an error for an invalid input", () =>
    expectErr(struct(1), "string test", { input: 1, path: [] }));
});

describe(".chain()", () => {
  const trim = (str: string) => str.trim();
  const lower = (str: string) => str.toLowerCase();
  const struct = chain(string("string test"), trim, lower);

  it("should return a valid result for a valid input", () =>
    expectOk(struct(" TEST  "), "test"));

  it("returns err if base struct returns an error", () =>
    expectErr(struct(1), "string test", { input: 1, path: [] }));
});

describe(".unwrap()", () => {
  const struct = string("test");

  it("should unwrap a valid result", () => {
    const result = struct("test");
    expect(unwrap(result)).toEqual("test");
  });

  it("should throw an error if the result is an error", () => {
    const result = struct(1);
    expect(() => unwrap(result)).toThrowError("test");
  });
});

describe(".unwrapOr()", () => {
  const struct = string("test");

  it("should unwrap a valid result", () => {
    const result = struct("test");
    expect(unwrapOr(result, "default")).toEqual("test");
  });

  it("should return the default value if the result is an error", () => {
    const result = struct(1);
    expect(unwrapOr(result, "default")).toEqual("default");
  });
});
