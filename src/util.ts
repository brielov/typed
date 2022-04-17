import { Err, Obj, Ok, Result, Struct } from "./types";
import { StructError } from "./error";

/**
 * Check if value is a string.
 */
export function isString(value: unknown): value is string {
  return typeof value === "string";
}

/**
 * Check if value is a valid number.
 */
export function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

/**
 * Check if value is a boolean.
 */
export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

/**
 * Check if value is undefined.
 */
export function isUndefined(value: unknown): value is undefined {
  return typeof value === "undefined";
}

/**
 * Check if value is a valid Date.
 */
export function isDate(value: unknown): value is Date {
  return value instanceof Date && Number.isFinite(value.getTime());
}

/**
 * Check if value is an array.
 */
export function isArray(value: unknown): value is any[] {
  return Array.isArray(value);
}

/**
 * Check if value is null.
 */
export function isNull(value: unknown): value is null {
  return value === null;
}

/**
 * Check if value is an object.
 */
export function isObject(value: unknown): value is Obj {
  return typeof value === "object" && !isNull(value) && !isArray(value);
}

/**
 * Create a new Ok result.
 */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value };
}

/**
 * Create a new Err result.
 */
export function err<E extends Error>(error: E): Err<E> {
  return { ok: false, error };
}

/**
 * Check if result is an Ok.
 */
export function isOk<T, E extends Error>(
  result: Result<T, E>,
): result is Ok<T> {
  return result.ok;
}

/**
 * Check if result is an Err.
 */
export function isErr<T, E extends Error>(
  result: Result<T, E>,
): result is Err<E> {
  return !isOk(result);
}

/**
 * Map a base struct into another struct.
 */
export const map =
  <T, O>(
    struct: Struct<T>,
    mapFn: (input: T) => Result<O, StructError>,
  ): Struct<O> =>
  (input) => {
    const result = struct(input);
    return isOk(result) ? mapFn(result.value) : result;
  };

/**
 * Takes the output of a struct and feeds it into a series of functions that accept and return the same type.
 */
export const chain =
  <T>(struct: Struct<T>, ...fns: ((input: T) => T)[]): Struct<T> =>
  (input) => {
    const result = struct(input);
    if (isErr(result)) return result;
    return ok(fns.reduce((acc, fn) => fn(acc), result.value));
  };

/**
 * Returns the inner value of an Ok. Throws an error if the result is an Err.
 */
export function unwrap<T, E extends Error>(result: Result<T, E>): T {
  if (isOk(result)) {
    return result.value;
  } else {
    throw result.error;
  }
}

/**
 * Returns the inner value of an Ok. Returns the default value if the result is an Err.
 */
export function unwrapOr<T, E extends Error, D>(
  result: Result<T, E>,
  def: D,
): T | D {
  return isOk(result) ? result.value : def;
}
