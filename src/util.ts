import type { Err, Failure, Result, Success } from "./common";

/**
 * Create a commonly used message of missmatching types
 */
export const toMessage = (expected: string, actual: string) =>
  `Expecting type '${expected}'. Got type '${actual}'`;

/**
 * Create a new error object.
 *
 * @param message - The error message.
 * @param path - The path to the error.
 * @returns The error object.
 * @since 1.0.0
 */
export const toError = (message: string, path: string[] = []): Err => ({
  path,
  message,
});

/**
 * Create a typed success result.
 *
 * @param value - The value to wrap.
 * @returns The success result.
 * @since 1.0.0
 */
export const success = <T>(value: T): Success<T> => ({
  success: true,
  value,
});

/**
 * Create a failure result.
 * @param errors - The errors to wrap.
 * @since 1.0.0
 */
export const failure = (...errors: Err[]): Failure => ({
  success: false,
  errors,
});

/**
 * Create a new result based on wether errors have length or not
 */
export const toResult = <T>(data: T, errors: Err[]): Result<T> =>
  errors.length ? failure(...errors) : success(data);

/**
 * Prepend key to error list
 */
export const mapErrorKey = (errors: Err[], key: string | number): Err[] =>
  errors.map((err) => toError(err.message, [String(key), ...err.path]));

/**
 * Get the type of a value
 */
export const getTypeOf = (value: unknown) =>
  Object.prototype.toString.call(value).slice(8, -1).toLowerCase();

/**
 * Given a result, run the onLeft callback if it is a failure or the onRight callback if it is a success.
 *
 * @param result - The result to run the callback on.
 * @param onLeft - The callback to run if the result is a failure.
 * @param onRight - The callback to run if the result is a success.
 * @returns Either the result of the onLeft callback or the result of the onRight callback.
 * @since 1.1.0
 */
export const fold = <T, L, R>(
  result: Result<T>,
  onLeft: (errors: Err[]) => L,
  onRight: (value: T) => R,
) => (result.success ? onRight(result.value) : onLeft(result.errors));

/**
 * Check wether the value is a plain object
 */
export const isPlainObject = (
  value: unknown,
): value is { [key: string]: unknown } =>
  value !== null && typeof value === "object" && !Array.isArray(value);
