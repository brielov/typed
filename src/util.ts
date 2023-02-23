import { isString } from "./type-guards";

export function raise(msg: string): never;
export function raise(err: Error): never;
export function raise(err: string | Error) {
  if (isString(err)) throw new Error(err);
  throw err;
}

export function assert(
  condition: unknown,
  msg = "Assertion failed",
): asserts condition {
  if (!condition) raise(msg);
}

export function identity<T>(arg: T): T {
  return arg;
}
