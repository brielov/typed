import type { Err, Failure, Result, Success } from "./common";

/**
 * Create a commonly used message of missmatching types
 */
export const toMessage = (expected: string, actual: string) =>
  `Expecting type '${expected}'. Got type '${actual}'`;

/**
 * Create a new error object
 */
export const toError = (message: string, path: string[] = []): Err => ({
  path,
  message,
});

/**
 * Create a typed success result
 */
export const success = <T>(value: T): Success<T> => ({
  success: true,
  value,
});

/**
 * Create a failure result
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
 * Borrowed from `superstruct`
 * @see https://github.com/ianstormtaylor/superstruct/blob/28e0b32d5506a7c73e63f7e718b23977e58aac18/src/utils.ts#L24
 */
export const isPlainObject = (x: unknown): x is { [key: string]: unknown } => {
  if (Object.prototype.toString.call(x) !== "[object Object]") {
    return false;
  }

  const prototype = Object.getPrototypeOf(x);
  return prototype === null || prototype === Object.prototype;
};

/**
 * Get the type of a value
 */
export const getTypeOf = (value: unknown) =>
  Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
