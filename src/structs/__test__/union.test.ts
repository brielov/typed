import { expectErr, expectOk } from "../../test-util";
import { number } from "../number";
import { string } from "../string";
import { union } from "../union";

const struct = union([string("string test"), number("number test")]);

it("returns err if no union matches", () =>
  expectErr(struct([]), "Expecting one of the specified structs"));

it("returns ok if the input is a string", () =>
  expectOk(struct("hello"), "hello"));

it("returns ok if the input is a number", () => expectOk(struct(1), 1));

it("returns err if the input is not a string or number", () => {
  expectErr(struct(true), "Expecting one of the specified structs", {
    input: true,
    path: [],
  });
  expectErr(struct({}), "Expecting one of the specified structs", {
    input: {},
    path: [],
  });
});
