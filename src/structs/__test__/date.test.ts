import { asDate, date } from "../date";
import { expectErr, expectOk } from "../../test-util";

const struct = date("test");

describe(".date()", () => {
  it("has default error", () =>
    expectErr(date()(undefined), "Expecting date", {
      input: undefined,
      path: [],
    }));

  it("returns err if input is not a date", () =>
    expectErr(struct(null), "test", { input: null, path: [] }));

  it("returns err if input is a date but it is invalid", () => {
    const struct = date("test");
    const value = new Date("invalid");
    expectErr(struct(value), "test", { input: value, path: [] });
  });

  it("returns ok if input is a date and it is valid", () => {
    const struct = date("test");
    const value = new Date();
    expectOk(struct(value), value);
  });
});

describe(".asDate()", () => {
  it("returns ok if the input is a string", () => {
    const struct = asDate("test");
    const value = "2020-01-01";
    expectOk(struct(value), new Date(value));
  });

  it("returns ok if the input is a number", () => {
    const struct = asDate("test");
    const value = 1577836800000;
    expectOk(struct(value), new Date(value));
  });

  it("returns err if the input is not a string or number", () => {
    const struct = asDate("test");
    expectErr(struct(true), "test", { input: true, path: [] });
    expectErr(struct({}), "test", { input: {}, path: [] });
  });
});
