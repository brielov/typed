import type { Err, Failure, Guard, Result, Success } from "./types";

export const toTypeMessage = (expected: string, actual: string) =>
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

export const toPayload = <T>(data: T, errors: Err[]): Result<T> =>
  errors.length ? failure(...errors) : success(data);

export const mapErrorKey = (errors: Err[], key: string | number): Err[] =>
  errors.map((err) => toError(err.message, [String(key), ...err.path]));

export const isPlainObject = (x: unknown): x is { [key: string]: unknown } => {
  if (Object.prototype.toString.call(x) !== "[object Object]") {
    return false;
  }

  const prototype = Object.getPrototypeOf(x);
  return prototype === null || prototype === Object.prototype;
};

export const map =
  <I, O>(guard: Guard<I>, onSuccess: (value: I) => Result<O>): Guard<O> =>
  (x) => {
    const result = guard(x);
    return result.success ? onSuccess(result.data) : result;
  };
