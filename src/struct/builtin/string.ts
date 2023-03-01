import { Err, Ok } from "../../result";
import { isString } from "../../type-guards";
import { Struct } from "../types";
import { createError } from "../util";

export const string =
  (opts?: { coerce?: boolean; trim?: boolean }): Struct<string> =>
  (input) => {
    if (opts?.coerce) {
      input = String(input);
    }
    return isString(input)
      ? Ok(opts?.trim ? input.trim() : input)
      : Err(createError());
  };
