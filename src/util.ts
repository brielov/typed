// deno-lint-ignore-file no-explicit-any
import type { Err, Failure, Result, Success, Type } from "./common.ts";

/**
 * Create a new `Success` result.
 * @since 3.0.0
 */
export function ok<T>(data: T): Success<T> {
  return { ok: true, data };
}

/**
 * Create a new `Failure` result.
 * @since 3.0.0
 */
export function err(...errors: Err[]): Failure {
  return { ok: false, errors };
}

/**
 * Check wether the value is a plain object
 */
export function isPlainObject(value: any): value is { [key: string]: any } {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

/**
 * Create a commonly used message of mismatching types
 */
export function toMismatchMsg(expected: string, actual: string) {
  return `Expecting type '${expected}'. Got type '${actual}'.`;
}

/**
 * Create a new error object.
 *
 * @param message - The error message.
 * @param path - The path to the error.
 * @returns The error object.
 * @since 1.0.0
 */
export function toErr(message: string, path: string[] = []): Err {
  return { message, path };
}

/**
 * Prepend key to error list
 */
export function mapErrorKey(key: string | number, ...errors: Err[]): Err[] {
  return errors.map(function (err) {
    return { ...err, path: [key.toString(), ...err.path] };
  });
}

/**
 * Get the type of a value
 */
export function getTypeOf(x: any): string {
  return Object.prototype.toString.call(x).slice(8, -1).toLowerCase();
}

/**
 * Create a new type from a given base type.
 * It ensures that the base type passes validation before carrying on.
 *
 * @example
 * ```ts
 * const emailType = T.map(T.string, (value) =>
 *  EMAIL_REGEX.test(value)
 *    ? T.ok(value)
 *    : T.err(T.toError('Expecting string to be a valid email address'))
 * )
 * ```
 *
 * @param base - The base type.
 * @param onSuccess - The mapping function.
 * @returns The new type.
 * @since 1.0.0
 */
export function map<I, O>(
  base: Type<I>,
  onSuccess: (data: I) => Result<O>
): Type<O> {
  return function (x: any) {
    const result = base(x);
    return result.ok ? onSuccess(result.data) : result;
  };
}

/**
 * It allows you to further process the result of a type.
 * Specially usefull when trimming, upper casing, etc.
 * Keep in mind that the output type must be the same as the input type.
 *
 * @example
 * ```ts
 * const lowerTrim = T.refine(T.string, (value) => value.trim().toLowerCase())
 * lowerTrim('  HELLO WORLD  ') // Ok('hello world')
 * ```
 *
 * @param base - The base type.
 * @param onSuccess - The mapping function.
 * @returns The new type.
 * @since 1.3.0
 */
export function refine<T>(base: Type<T>, onSuccess: (data: T) => T): Type<T> {
  return map(base, function (data) {
    return ok(onSuccess(data));
  });
}
