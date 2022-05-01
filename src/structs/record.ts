import { Struct } from "../types";
import { StructError } from "../error";
import { err, isErr, isObject, ok } from "../util";

/**
 * Creates a new type that accepts an object with a given key struct and value struct.
 * It behaves like a typescript `Record` type.
 */
export const record =
  <K extends string, T>(
    key: Struct<K>,
    value: Struct<T>,
    msg = "Expecting object",
  ): Struct<Record<K, T>> =>
  (input) => {
    if (!isObject(input)) return err(new StructError(msg, { input, path: [] }));
    const obj = Object.create(null);
    for (const [k, v] of Object.entries(input)) {
      const kr = key(k);
      if (isErr(kr)) {
        kr.error.info.path.unshift(k);
        return kr;
      }
      const vr = value(v);
      if (isErr(vr)) {
        vr.error.info.path.unshift(k);
        return vr;
      }
      obj[kr.value] = vr.value;
    }
    return ok(obj);
  };
