import { isFunction, isPlainObject, isPresent } from "../type-guards";
import { Maybe } from "../types";
import { NONE } from "./none";
import { Some } from "./some";
import { Option } from "./types";

export function toOption<T>(value: Maybe<T>): Option<T> {
  return isPresent(value) ? Some(value) : NONE;
}

export function isOption(value: unknown): value is Option<unknown> {
  return (
    isPlainObject(value) &&
    "isSome" in value &&
    isFunction(value.isSome) &&
    "isNone" in value &&
    isFunction(value.isNone)
  );
}
