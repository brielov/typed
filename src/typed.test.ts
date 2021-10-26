import * as G from "./typed";
import { success } from "./util";

describe(".string()", () => {
  it("fails when value is not a string", () => {
    expect(G.string(1)).toHaveProperty("success", false);
  });

  it("succeeds when value is a string", () => {
    expect(G.string("")).toEqual(success(""));
  });
});

describe(".number()", () => {
  it("fails when value is not a number", () => {
    expect(G.number("1")).toHaveProperty("success", false);
    expect(G.number(NaN)).toHaveProperty("success", false);
  });

  it("succeeds when value is a number", () => {
    expect(G.number(1)).toEqual(success(1));
  });
});

describe(".boolean()", () => {
  it("fails when value is not a boolean", () => {
    expect(G.boolean("")).toHaveProperty("success", false);
  });

  it("succeeds when value is a boolean", () => {
    expect(G.boolean(false)).toEqual(success(false));
  });
});

describe(".date()", () => {
  it("fails when value is not a date", () => {
    expect(G.date("1")).toHaveProperty("success", false);
  });

  it("succeeds when value is a date", () => {
    const d = new Date();
    expect(G.date(d)).toEqual(success(d));
  });
});

describe(".array()", () => {
  it("fails when value is not an array", () => {
    expect(G.array(G.string)({})).toHaveProperty("success", false);
  });

  it("fails when any of the items is not of the specified type", () => {
    expect(G.array(G.string)([1])).toHaveProperty("success", false);
  });

  it("succeeds when every item is of the specified type", () => {
    expect(G.array(G.string)([""])).toEqual(success([""]));
  });
});

describe(".object()", () => {
  it("fails when value is not an object", () => {
    expect(G.object({})([])).toHaveProperty("success", false);
  });

  it("fails when the value does not conform to the shape", () => {
    expect(G.object({ id: G.number })({ id: "" })).toHaveProperty(
      "success",
      false,
    );
  });

  it("succeeds when every type on shape succeeds", () => {
    expect(G.object({ id: G.number })({ id: 1 })).toEqual(success({ id: 1 }));
  });

  it("removes all properties that are not on the shape", () => {
    expect(G.object({ id: G.number })({ id: 1, name: "John" })).toEqual(
      success({ id: 1 }),
    );
  });
});

describe(".literal()", () => {
  it("throws an error when constant is not a valid literal", () => {
    expect(() => G.literal({} as any)).toThrow(TypeError);
  });

  it("fails when value is not equal to the constant", () => {
    expect(G.literal("hello")("hell")).toHaveProperty("success", false);
  });

  it("succeeds when value is equal to constant", () => {
    expect(G.literal("hello")("hello")).toEqual(success("hello"));
  });
});

describe(".nullable()", () => {
  it("fails when value is not null", () => {
    expect(G.nullable(G.string)(undefined)).toHaveProperty("success", false);
  });

  it("succeeds when value is null", () => {
    expect(G.nullable(G.string)(null)).toEqual(success(null));
  });

  it("succeeds when type succeeds", () => {
    expect(G.nullable(G.string)("")).toEqual(success(""));
  });
});

describe(".optional()", () => {
  it("fails when value is not undefined", () => {
    expect(G.optional(G.string)(null)).toHaveProperty("success", false);
  });

  it("succeeds when value is undefined", () => {
    expect(G.optional(G.string)(undefined)).toEqual(success(undefined));
  });

  it("succeeds when type succeeds", () => {
    expect(G.optional(G.string)("")).toEqual(success(""));
  });
});

describe(".enums()", () => {
  enum Role {
    admin,
    user,
  }

  it("fails when value is not an enum", () => {
    const actual = G.enums(Role)("whatever");
    expect(actual).toHaveProperty("success", false);
  });

  it("succeeds when value is enum", () => {
    expect(G.enums(Role)(Role.admin)).toEqual(success(Role.admin));
  });
});

describe(".tuple()", () => {
  it("fails when value is not an array", () => {
    expect(G.tuple(G.string)({})).toHaveProperty("success", false);
  });

  it("fails when value has less items than tuple", () => {
    expect(G.tuple(G.string, G.number)([""])).toHaveProperty("success", false);
  });

  it("succeeds when all types succeed", () => {
    expect(G.tuple(G.string, G.number, G.boolean)(["", 0, false])).toEqual(
      success(["", 0, false]),
    );
  });

  it("removes extra items", () => {
    expect(G.tuple(G.string, G.number)(["", 0, false])).toEqual(
      success(["", 0]),
    );
  });
});

describe(".union()", () => {
  it("fails when type fails", () => {
    expect(G.union(G.number, G.string)(false)).toHaveProperty("success", false);
  });

  it("succeeds when type succeed", () => {
    expect(G.union(G.number, G.string)("")).toEqual(success(""));
  });
});

describe(".any", () => {
  it("should always succeed", () => {
    expect(G.any("")).toEqual(success(""));
    expect(G.any(1)).toEqual(success(1));
    expect(G.any(false)).toEqual(success(false));
    expect(G.any([])).toEqual(success([]));
    expect(G.any({})).toEqual(success({}));
    expect(G.any(null)).toEqual(success(null));
    expect(G.any(undefined)).toEqual(success(undefined));
  });
});

describe(".asString()", () => {
  it("coerces value to a string", () => {
    expect(G.asString(1)).toEqual(success("1"));
  });
});

describe(".asNumber()", () => {
  it("coerces value to a number", () => {
    expect(G.asNumber("1")).toEqual(success(1));
  });
});

describe(".asDate()", () => {
  it("coerces value to a date", () => {
    const d = new Date("2021-10-22");
    expect(G.asDate(d.toISOString())).toEqual(success(d));
  });
});

describe(".defaulted()", () => {
  it("fails when type fails", () => {
    expect(G.defaulted(G.string, "hello")(1)).toHaveProperty("success", false);
  });

  it("returns fallback when value is undefined", () => {
    expect(G.defaulted(G.string, "hello")(void 0)).toEqual(success("hello"));
  });

  it("returns value when is not undefined", () => {
    expect(G.defaulted(G.string, "hello")("world")).toEqual(success("world"));
  });
});
