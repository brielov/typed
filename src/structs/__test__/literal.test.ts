import { expectErr, expectOk } from "../../test-util";
import { literal } from "../literal";

const struct = literal("hello", "expecting hello");

it('returns ok if the input is "hello"', () =>
  expectOk(struct("hello"), "hello"));

it("has default error", () =>
  expectErr(literal("hello")("world"), "Expecting literal"));

it('returns err if the input is not "hello"', () =>
  expectErr(struct("world"), "expecting hello", {
    input: "world",
    path: [],
  }));
