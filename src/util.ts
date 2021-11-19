import type { Err, Failure, Result, Success } from "./common";

/**
 * Creates a commonly used message of missmatching types
 */
export const toMessage = (expected: string, actual: string) =>
  `Expecting type '${expected}'. Got type '${actual}'`;

/**
 * Creates a new error object.
 *
 * @param {string} message - The error message.
 * @param {string[]} path - The path to the error.
 * @returns {Err}
 * @since 1.0.0
 */
export const toError = (message: string, path: string[] = []): Err => ({
  path,
  message,
});

/**
 * Creates a typed success result.
 *
 * @template T
 * @param {T} value - The value to wrap.
 * @returns {Success<T>}
 * @since 1.0.0
 */
export const success = <T>(value: T): Success<T> => ({
  success: true,
  value,
});

/**
 * Creates a failure result.
 * @param {...Err[]} errors - The errors to wrap.
 * @since 1.0.0
 */
export const failure = (...errors: Err[]): Failure => ({
  success: false,
  errors,
});

/**
 * Creates a new result based on wether errors have length or not
 */
export const toResult = <T>(data: T, errors: Err[]): Result<T> =>
  errors.length ? failure(...errors) : success(data);

/**
 * Prepends key to error list
 */
export const mapErrorKey = (errors: Err[], key: string | number): Err[] =>
  errors.map((err) => toError(err.message, [String(key), ...err.path]));

/**
 * Gets the type of a value
 */
export const getTypeOf = (value: unknown) =>
  Object.prototype.toString.call(value).slice(8, -1).toLowerCase();

/**
 * Given a result, run the onLeft callback if it is a failure or the onRight callback if it is a success.
 *
 * @template T, L, R
 * @param {Result<T>} result - The result to run the callback on.
 * @param {(errors: Err[]) => L} onLeft - The callback to run if the result is a failure.
 * @param {(value: T) => R} onRight - The callback to run if the result is a success.
 * @returns {L | R}
 * @since 1.1.0
 */
export const fold = <T, L, R>(
  result: Result<T>,
  onLeft: (errors: Err[]) => L,
  onRight: (value: T) => R,
) => (result.success ? onRight(result.value) : onLeft(result.errors));

/**
 * Checks wether the value is a plain object
 */
export const isPlainObject = (
  value: unknown,
): value is { [key: string]: unknown } =>
  value !== null && typeof value === "object" && !Array.isArray(value);
