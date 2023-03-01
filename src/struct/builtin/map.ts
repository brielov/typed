import { Result } from "../../result";
import { Struct, StructError } from "../types";

export function map<T, U>(
  struct: Struct<T>,
  fn: (value: T) => Result<U, StructError>,
): Struct<U, StructError> {
  return (input) => struct(input).andThen(fn);
}
