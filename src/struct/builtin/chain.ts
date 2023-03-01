import { Ok } from "../../result";
import { Struct } from "../types";

export function chain<T>(
  struct: Struct<T>,
  ...fns: ((value: T) => T)[]
): Struct<T> {
  return (input) =>
    struct(input).andThen((value) =>
      Ok(fns.reduce((prev, fn) => fn(prev), value)),
    );
}
