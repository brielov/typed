import { enums } from "../enums";

enum TestEnum {
  A = 1,
  B = 2,
  C = 3,
}

describe(".enums()", () => {
  it("returns ok if the input is a valid enum value", () => {
    const struct = enums(TestEnum, "test");
    expect(struct(TestEnum.A)).toBeOk(TestEnum.A);
  });

  it("returns err if the input is not a valid enum value", () => {
    const struct = enums(TestEnum, "test");
    expect(struct(null)).toBeErr("test", { input: null, path: [] });
  });
});
