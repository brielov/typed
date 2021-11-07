import type {
  Enum,
  Err,
  Infer,
  InferTuple,
  Literal,
  Result,
  Shape,
  Typed,
} from "./common";
import {
  failure,
  getTypeOf,
  isPlainObject,
  mapErrorKey,
  success,
  toError,
  toMessage,
  toResult,
} from "./util";

/**
 * Create a new Type that maps an input type to an output type
 * @since 1.0.0
 */
export const map =
  <I, O>(type: Typed<I>, onSuccess: (value: I) => Result<O>): Typed<O> =>
  (x) => {
    const result = type(x);
    return result.success ? onSuccess(result.value) : result;
  };

/**
 * Check if value is a string
 * @since 1.0.0
 */
export const string: Typed<string> = (x) =>
  typeof x === "string"
    ? success(x)
    : failure(toError(toMessage("string", getTypeOf(x))));

/**
 * Check if value is a number
 * @since 1.0.0
 */
export const number: Typed<number> = (x) =>
  typeof x === "number"
    ? Number.isFinite(x)
      ? success(x)
      : failure(toError(`Expecting value to be a finite 'number'`))
    : failure(toError(toMessage("number", getTypeOf(x))));

/**
 * Check if value is a boolean
 * @since 1.0.0
 */
export const boolean: Typed<boolean> = (x) =>
  typeof x === "boolean"
    ? success(x)
    : failure(toError(toMessage("boolean", getTypeOf(x))));

/**
 * Check if value is a valid date
 * @since 1.0.0
 */
export const date: Typed<Date> = (x) =>
  x instanceof Date
    ? Number.isFinite(x.getTime())
      ? success(x)
      : failure(toError(`Expecting value to be a valid 'date'`))
    : failure(toError(toMessage("date", getTypeOf(x))));

/**
 * Check if value is an array of type T
 * @since 1.0.0
 */
export const array =
  <T>(type: Typed<T>): Typed<T[]> =>
  (x) => {
    if (!Array.isArray(x)) {
      return failure(toError(toMessage("array", getTypeOf(x))));
    }
    const arr = [];
    const err: Err[] = [];
    for (let i = 0; i < x.length; i++) {
      const result = type(x[i]);
      if (result.success) {
        arr.push(result.value);
      } else {
        err.push(...mapErrorKey(result.errors, i));
      }
    }
    return toResult(arr, err);
  };

/**
 * Check if value is an object with the specified shape
 * @since 1.0.0
 */
export const object = <T extends Shape>(shape: T): Typed<Infer<T>> => {
  const entries = Object.entries(shape);
  return (x) => {
    if (!isPlainObject(x)) {
      return failure(toError(toMessage("object", getTypeOf(x))));
    }
    const obj = Object.create(null);
    const err: Err[] = [];
    for (const [key, type] of entries) {
      const result = type(x[key]);
      if (result.success) {
        obj[key] = result.value;
      } else {
        err.push(...mapErrorKey(result.errors, key));
      }
    }
    return toResult(obj, err);
  };
};

/**
 * check if value is a literal
 * @since 1.0.0
 */
export const literal =
  <T extends Literal>(constant: T): Typed<T> =>
  (x) =>
    constant === x
      ? success(x as T)
      : failure(toError(`Expecting literal '${constant}'. Got '${x}'`));

/**
 * Check if value is of type T or null
 * @since 1.0.0
 */
export const nullable =
  <T>(type: Typed<T>): Typed<T | null> =>
  (x) =>
    x === null ? success(x) : type(x);

/**
 * Check if value is of type T or undefined
 * @since 1.0.0
 */
export const optional =
  <T>(type: Typed<T>): Typed<T | undefined> =>
  (x) =>
    typeof x === "undefined" ? success(x) : type(x);

/**
 * Check if value is an enum. This function expects a real TypeScript enum type
 * @since 1.0.0
 */
export const enums = <T extends Enum, K extends keyof T>(e: T): Typed<T[K]> => {
  const values = Object.values(e);
  return (x) => {
    return values.includes(x as any)
      ? success(x as T[K])
      : failure(
          toError(
            `Expecting value to be one of '${values.join(", ")}'. Got '${x}'`,
          ),
        );
  };
};

/**
 * Check if value is a tuple
 * @since 1.0.0
 */
export const tuple =
  <A extends Typed, B extends Typed[]>(
    ...types: [A, ...B]
  ): Typed<[Infer<A>, ...InferTuple<B>]> =>
  (x) => {
    if (!Array.isArray(x)) {
      return failure(toError(toMessage("array", getTypeOf(x))));
    }

    const arr: unknown[] = [];
    const err: Err[] = [];

    for (let i = 0; i < types.length; i++) {
      const result = types[i](x[i]);
      if (result.success) {
        arr.push(result.value);
      } else {
        err.push(...mapErrorKey(result.errors, i));
      }
    }

    return toResult(arr as any, err);
  };

/**
 * Check if value is any of the specified types
 * @since 1.0.0
 */
export const union =
  <A extends Typed, B extends Typed[]>(
    ...types: [A, ...B]
  ): Typed<Infer<A> | InferTuple<B>[number]> =>
  (x): Result<Infer<A> | InferTuple<B>[number]> => {
    const errors: Err[] = [];

    for (const type of types) {
      const result = type(x);
      if (result.success) {
        return result as any;
      }
      errors.push(...result.errors);
    }

    return failure(...errors);
  };

/**
 * A passthrough function which returns its input marked as any.
 * Do not use this unless you really need to, it defeats the purpose of this library.
 * @since 1.0.0
 */
export const any: Typed<any> = (x): any => success(x);

/**
 * Returns a default value when input is undefined
 * @since 1.0.0
 */
export const defaulted =
  <T>(type: Typed<T>, fallback: T): Typed<T> =>
  (x) =>
    typeof x === "undefined" ? success(fallback) : type(x);

/**
 * Coerce first, then check if value is a string
 * @since 1.0.0
 */
export const asString: Typed<string> = (x) => string(String(x));

/**
 * Coerce first, then check if value is a number
 * @since 1.0.0
 */
export const asNumber: Typed<number> = (x) => number(Number(x));

/**
 * Coerce first, then check if value is a valid date
 * @since 1.0.0
 */
export const asDate: Typed<Date> = (x) =>
  date(typeof x === "string" || typeof x === "number" ? new Date(x) : x);
