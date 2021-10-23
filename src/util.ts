import type { Err, Failure, Result, Success, Type } from "./types";

export const toMessage = (expected: string, actual: string) =>
  `Expecting type '${expected}'. Got type '${actual}'`;

export const toError = (message: string, path: string[] = []): Err => ({
  path,
  message,
});

export const success = <T>(data: T): Success<T> => ({
  success: true,
  data,
});

export const failure = (...errors: Err[]): Failure => ({
  success: false,
  errors,
});

export const toResult = <T>(data: T, errors: Err[]): Result<T> =>
  errors.length ? failure(...errors) : success(data);

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
 * Create a new Type that maps an input type to an output type
 */
export const map =
  <I, O>(type: Type<I>, onSuccess: (value: I) => Result<O>): Type<O> =>
  (x) => {
    const result = type(x);
    return result.success ? onSuccess(result.data) : result;
  };
