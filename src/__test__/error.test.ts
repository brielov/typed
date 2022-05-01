import { StructError } from "../error";

it("has a default path", () => {
  const error = new StructError("test");
  expect(error.info.path).toEqual([]);
});

it("implements .toJSON() method", () => {
  const error = new StructError("test", { input: 1, path: ["2"] });
  expect(error.toJSON()).toEqual({
    message: "test",
    info: {
      input: 1,
      path: ["2"],
    },
  });
});
