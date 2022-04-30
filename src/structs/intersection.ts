import { Infer, InferTuple, Obj, Struct, UnionToIntersection } from "../types";
import { isErr, ok } from "../util";

/**
 * Creates a new struct that merges other structs.
 * Behaves like typescript `interface A extends B, C, D {}`
 */
export const intersection =
  <A extends Struct<Obj>, B extends Struct<Obj>[]>(
    structs: [A, ...B],
  ): Struct<Infer<A> & UnionToIntersection<InferTuple<B>[number]>> =>
  (input) => {
    const obj = Object.create(null);
    for (const struct of structs) {
      const result = struct(input);
      if (isErr(result)) return result;
      Object.assign(obj, result.value);
    }
    return ok(obj);
  };

if (import.meta.vitest) {
  const { it } = import.meta.vitest;
  const { expectErr, expectOk } = await import("../test-util");
  const { object } = await import("./object");
  const { number } = await import("./number");
  const { string } = await import("./string");
  const { optional } = await import("./optional");
  const { boolean } = await import("./boolean");

  const structA = object({
    a: number("a"),
  });

  const structB = object({
    b: string("b error"),
    c: optional(boolean("c")),
  });

  const struct = intersection([structA, structB]);

  it("returns err if the input is not the same struct", () =>
    expectErr(struct({ a: 1 }), "b error", { path: ["b"] }));

  it("returns ok if the input is the same struct", () =>
    expectOk(struct({ a: 1, b: "2", c: true }), { a: 1, b: "2", c: true }));
}
