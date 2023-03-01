import { Err, Ok } from "../../result";
import { isBoolean, isString } from "../../type-guards";
import { Struct } from "../types";
import { createError } from "../util";

export const boolean =
  (opts?: { coerce?: boolean }): Struct<boolean> =>
  (input) => {
    if (opts?.coerce) {
      if (isString(input)) {
        switch (input.toLowerCase()) {
          case "true":
          case "yes":
          case "on": {
            input = true;
            break;
          }
          default: {
            input = false;
          }
        }
      } else {
        input = Boolean(input);
      }
    }
    return isBoolean(input) ? Ok(input) : Err(createError());
  };
