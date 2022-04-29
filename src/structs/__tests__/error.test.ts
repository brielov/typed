import { StructError } from "../../error";

describe("StructError", () => {
  it("has a default path", () => {
    const error = new StructError("test");
    expect(error.info.path).toEqual([]);
  });

  describe(".toJSON()", () => {
    it("returns the error message", () => {
      const error = new StructError("test", { input: 1, path: ["2"] });
      expect(error.toJSON()).toEqual({
        message: "test",
        info: {
          input: 1,
          path: ["2"],
        },
      });
    });
  });
});
