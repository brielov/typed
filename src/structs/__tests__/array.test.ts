import { any } from "../any";
import { array } from "../array";
import { string } from "../string";

describe(".array()", () => {
  it("returns err if input is not an array", () => {
    const struct = array(any, "test");
    expect(struct(null)).toBeErr("test");
  });

  it("returns err if any of the array elements is not of the expected struct", () => {
    const struct = array(string("test"));
    const result = struct(["a", "b", 2]);
    expect(result).toBeErr("test", { input: 2, path: ["2"] });
  });

  it("returns ok if all of the array elements are of the expected struct", () => {
    const struct = array(string("test"));
    const value = ["a", "b", "c"];
    const result = struct(value);
    expect(result).toBeOk(value);
  });
});
