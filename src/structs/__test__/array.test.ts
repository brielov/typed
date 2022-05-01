import { any } from "../any";
import { array } from "../array";
import { expectErr, expectOk } from "../../test-util";
import { string } from "../string";

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
