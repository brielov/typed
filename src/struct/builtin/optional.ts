import { None, Option, Some } from "../../option";
import { Ok } from "../../result";
import { isNil } from "../../type-guards";
import { Struct } from "../types";

export const optional =
  <T>(struct: Struct<T>): Struct<Option<T>> =>
  (input) => {
    if (isNil(input)) return Ok(None);
    return struct(input).andThen((value) => Ok(Some(value)));
  };
