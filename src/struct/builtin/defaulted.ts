import { Ok } from "../../result";
import { isNil } from "../../type-guards";
import { Struct } from "../types";

export const defaulted =
  <T>(struct: Struct<T>, defaultValue: T): Struct<T> =>
  (input) => {
    if (isNil(input)) return Ok(defaultValue);
    return struct(input);
  };
