import { Err, Ok } from "../../result";
import { isDate, isNumber, isString } from "../../type-guards";
import { Struct } from "../types";
import { createError } from "../util";

export const date = (opts?: { coerce?: boolean }): Struct<Date> => {
  return (input) => {
    if (opts?.coerce) {
      if (isNumber(input) || isString(input)) {
        input = new Date(input);
      }
    }
    return isDate(input) ? Ok(input) : Err(createError());
  };
};
