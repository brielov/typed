import { expectErr, expectOk } from "../../test-util";
import { number } from "../number";
import { string } from "../string";
import { tuple } from "../tuple";

const struct = tuple([string(), number("number test")], "test");

it("has default error", () => {
  const struct = tuple([string(), number("number test")]);
  expectErr(struct(null), "Expecting tuple");
});

it("returns ok if the input is an array", () =>
  expectOk(struct(["hello", 1]), ["hello", 1]));

it("returns err if the input is not an array", () =>
  expectErr(struct(1), "test", { input: 1, path: [] }));

it("returns err if the input is an array with an invalid element", () =>
  expectErr(struct(["hello", {}]), "number test", {
    input: {},
    path: ["1"],
  }));
