import { literal } from "../literal";

describe(".literal()", () => {
  const struct = literal("hello", "expecting hello");

  it('returns ok if the input is "hello"', () => {
    expect(struct("hello")).toBeOk("hello");
  });

  it("has default error", () => {
    expect(literal("hello")("world")).toBeErr("Expecting literal");
  });

  it('returns err if the input is not "hello"', () => {
    expect(struct("world")).toBeErr("expecting hello", {
      input: "world",
      path: [],
    });
  });
});
