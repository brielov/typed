import { asDate, date } from "../date";

describe(".date()", () => {
  it("has default error", () => {
    expect(date()(undefined)).toBeErr("Expecting date");
  });

  it("returns err if input is not a date", () => {
    const struct = date("test");
    expect(struct(null)).toBeErr("test", { input: null, path: [] });
  });

  it("returns err if input is a date but it is invalid", () => {
    const struct = date("test");
    const value = new Date("invalid");
    expect(struct(value)).toBeErr("test", { input: value, path: [] });
  });

  it("returns ok if input is a date and it is valid", () => {
    const struct = date("test");
    const value = new Date();
    expect(struct(value)).toBeOk(value);
  });
});

describe(".asDate()", () => {
  it("returns ok if the input is a string", () => {
    const struct = asDate("test");
    const value = "2020-01-01";
    expect(struct(value)).toBeOk(new Date(value));
  });

  it("returns ok if the input is a number", () => {
    const struct = asDate("test");
    const value = 1577836800000;
    expect(struct(value)).toBeOk(new Date(value));
  });

  it("returns err if the input is not a string or number", () => {
    const struct = asDate("test");
    expect(struct(true)).toBeErr("test", { input: true, path: [] });
    expect(struct({})).toBeErr("test", { input: {}, path: [] });
  });
});
