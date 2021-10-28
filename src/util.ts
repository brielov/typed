import type { Err, Failure, Result, Success } from "./common";

/**
 * Create a commonly used message of missmatching types
 */
export const toMessage = (expected: string, actual: string) =>
  `Expecting type '${expected}'. Got type '${actual}'`;

/**
 * Create a new error object
 * @since 1.0.0
 */
export const toError = (message: string, path: string[] = []): Err => ({
  path,
  message,
});

/**
 * Create a typed success result
 * @since 1.0.0
 */
export const success = <T>(value: T): Success<T> => ({
  success: true,
  value,
});

/**
 * Create a failure result
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
 * Fold result into either `onLeft` if it fails or `onRight` if it succeeds.
 * @since 1.1.0
 */
export const fold = <T, L, R>(
  result: Result<T>,
  onLeft: (errors: Err[]) => L,
  onRight: (value: T) => R,
) => (result.success ? onRight(result.value) : onLeft(result.errors));
