import { boolean } from "../boolean";

describe(".boolean()", () => {
  it("returns err if input is not a boolean", () => {
    const struct = boolean("test");
    expect(struct(null)).toBeErr("test", { input: null, path: [] });
  });

  it("returns ok if input is a boolean", () => {
    const struct = boolean("test");
    expect(struct(true)).toBeOk(true);
    expect(struct(false)).toBeOk(false);
  });
});
