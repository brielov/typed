import { any } from "../any";
import { array, asArray, asOnly } from "../array";
import { expectErr, expectOk } from "../../test-util";
import { string } from "../string";

describe(".array()", () => {
  it("returns err if input is not an array", () => {
    const struct = array(any, "test");
    expectErr(struct(null), "test", { input: null, path: [] });
  });

  it("returns err if any of the array elements is not of the expected struct", () => {
    const struct = array(string("test"));
    const actual = struct(["a", "b", 2]);
    expectErr(actual, "test", { input: 2, path: ["2"] });
  });

  it("returns ok if all of the array elements are of the expected struct", () => {
    const struct = array(string("test"));
    const expected = ["a", "b", "c"];
    const actual = struct(expected);
    expectOk(actual, expected);
  });
});

describe(".asArray()", () => {
  it("converts a single value as an array", () => {
    const struct = asArray(string("test"));
    const expected = ["ok"];
    const actual = struct("ok");
    expectOk(actual, expected);
  });

  it("works as normal if input is already an array", () => {
    const struct = asArray(string("test"));
    const expected = ["ok"];
    const actual = struct(["ok"]);
    expectOk(actual, expected);
  });
});

describe(".asOnly()", () => {
  it("returns the first element (by default) if input is an array", () => {
    const struct = asOnly(string("test"));
    const expected = "ok";
    const actual = struct(["ok", "ko"]);
    expectOk(actual, expected);
  });

  it("returns the item at the given index if input is an array", () => {
    const struct = asOnly(string("test"), 1);
    const expected = "ko";
    const actual = struct(["ok", "ko"]);
    expectOk(actual, expected);
  });

  it("returns the input if it is not an array", () => {
    const struct = asOnly(string("test"));
    const expected = "ok";
    const actual = struct("ok");
    expectOk(actual, expected);
  });
});
