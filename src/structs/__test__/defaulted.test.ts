import { defaulted } from "../defaulted";
import { expectErr, expectOk } from "../../test-util";
import { number } from "../number";

const struct = defaulted(number("test"), 10);

it("returns err if the input is not the same struct", () =>
  expectErr(struct("5"), "test", { input: "5", path: [] }));

it("returns the default value if the input is undefined", () =>
  expectOk(struct(undefined), 10));

it("returns the input if the input is defined", () => expectOk(struct(5), 5));
