import { Err, Ok } from "../../result";
import { isNumber } from "../../type-guards";
import { Struct } from "../types";
import { createError } from "../util";

export const number =
  (opts?: { coerce?: boolean }): Struct<number> =>
  (input) => {
    if (opts?.coerce) {
      input = Number(input);
    }
    return isNumber(input) ? Ok(input) : Err(createError());
  };
