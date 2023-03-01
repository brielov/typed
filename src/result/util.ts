import { isFunction, isPlainObject } from "../type-guards";
import { Err } from "./err";
import { Ok } from "./ok";
import { Result } from "./types";

export function toResult<T>(f: () => T): Result<T, unknown> {
  try {
    return Ok(f());
  } catch (err) {
    return Err(err);
  }
}

export function toAsyncResult<T>(
  value: Promise<T> | (() => Promise<T>),
): Promise<Result<T, unknown>> {
  if (isFunction(value)) return toAsyncResult(value());
  return value.then(Ok).catch(Err);
}

export function isResult(value: unknown): value is Result<unknown, unknown> {
  return (
    isPlainObject(value) &&
    "isOk" in value &&
    isFunction(value.isOk) &&
    "isErr" in value &&
    isFunction(value.isErr)
  );
}
