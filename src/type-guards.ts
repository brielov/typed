import type { AnyFunc, Maybe, Nil, PlainObject, Primitive } from "./types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isInstanceOf<T extends new (...args: any[]) => any>(
  constructor: T,
  value: unknown,
): value is InstanceType<T> {
  return value instanceof constructor;
}

export function isString(value: unknown): value is string {
  return typeof value === "string";
}

export function isNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

export function isBoolean(value: unknown): value is boolean {
  return typeof value === "boolean";
}

export function isBigInt(value: unknown): value is bigint {
  return typeof value === "bigint";
}

export function isSymbol(value: unknown): value is symbol {
  return typeof value === "symbol";
}

export function isUndefined(value: unknown): value is undefined {
  return typeof value === "undefined";
}

export function isFunction(value: unknown): value is AnyFunc {
  return typeof value === "function";
}

export function isNull(value: unknown): value is null {
  return value === null;
}

export function isNil(value: unknown): value is Nil {
  return isNull(value) || isUndefined(value);
}

const PRIMITIVES = [
  isString,
  isNumber,
  isBoolean,
  isNull,
  isUndefined,
  isBigInt,
  isSymbol,
];

export function isPrimitive(value: unknown): value is Primitive {
  return PRIMITIVES.some((f) => f(value));
}

export function isDate(value: unknown): value is Date {
  return isInstanceOf(Date, value) && isNumber(value.getTime());
}

export function isArray(value: unknown): value is unknown[] {
  return Array.isArray(value);
}

export function isPlainObject(value: unknown): value is PlainObject {
  if (isPrimitive(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === null || proto === Object.prototype;
}

export function isIterable(value: unknown): value is Iterable<unknown> {
  if (isNil(value)) return false;
  const obj = Object(value);
  return Symbol.iterator in obj && isFunction(obj[Symbol.iterator]);
}

export function isPromise(value: unknown): value is Promise<unknown> {
  return (
    typeof value === "object" &&
    value !== null &&
    "then" in value &&
    isFunction(value.then)
  );
}

export function isPresent<T>(value: Maybe<T>): value is T {
  return !isNil(value);
}

export function isRegExp(value: unknown): value is RegExp {
  return isInstanceOf(RegExp, value);
}

export function isSet(value: unknown): value is Set<unknown> {
  return isInstanceOf(Set, value);
}

export function isMap(value: unknown): value is Map<unknown, unknown> {
  return isInstanceOf(Map, value);
}

export function isPositive(num: number): boolean {
  return num > 0;
}

export function isNegative(num: number): boolean {
  return !isPositive(num);
}

export function isInteger(num: number): boolean {
  return Number.isInteger(num);
}

export function isFloat(num: number): boolean {
  return !isInteger(num);
}

export function isEven(num: number): boolean {
  return num % 2 === 0;
}

export function isOdd(num: number): boolean {
  return !isEven(num);
}

export function isPrime(num: number): boolean {
  if (num < 2) {
    return false;
  }
  const sq = Math.sqrt(num);
  for (let i = 2; i <= sq; i++) {
    if (num % i === 0) {
      return false;
    }
  }
  return true;
}
