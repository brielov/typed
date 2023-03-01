import { Err, Ok } from "../../result";
import { isPlainObject } from "../../type-guards";
import { Struct } from "../types";
import { createError } from "../util";

export const record =
  <K extends string, T>(
    key: Struct<K>,
    value: Struct<T>,
  ): Struct<Record<K, T>> =>
  (input) => {
    if (!isPlainObject(input)) return Err(createError());
    const obj = Object.create(null);
    for (const [k, v] of Object.entries(input)) {
      const kr = key(k);
      if (kr.isErr()) {
        const err = kr.unwrapErr();
        err.path.unshift(k);
        return Err(err);
      }
      const vr = value(v);
      if (vr.isErr()) {
        const err = vr.unwrapErr();
        err.path.unshift(k);
        return Err(err);
      }
      obj[kr.unwrap()] = vr.unwrap();
    }
    return Ok(obj);
  };
