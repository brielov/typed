import { enums } from "../enums";
import { expectErr, expectOk } from "../../test-util";

enum TestEnum {
  A = 1,
  B = 2,
  C = 3,
}

const struct = enums(TestEnum, "test");

it("returns ok if the input is a valid enum value", () =>
  expectOk(struct(TestEnum.A), TestEnum.A));

it("returns err if the input is not a valid enum value", () =>
  expectErr(struct(null), "test", { input: null, path: [] }));
