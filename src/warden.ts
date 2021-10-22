import type {
  Enum,
  Err,
  Guard,
  Infer,
  InferTuple,
  Literal,
  Result,
  Shape,
} from "./types";
import {
  failure,
  isPlainObject,
  mapErrorKey,
  success,
  toError,
  toPayload,
  toTypeMessage,
} from "./util";

/**
 * Check if value is a string
 */
export const string: Guard<string> = (x) =>
  typeof x === "string"
    ? success(x)
    : failure(toError(toTypeMessage("string", typeof x)));

/**
 * Check if value is a number
 */
export const number: Guard<number> = (x) =>
  typeof x === "number"
    ? success(x)
    : failure(toError(toTypeMessage("number", typeof x)));

/**
 * Check if value is a boolean
 */
export const boolean: Guard<boolean> = (x) =>
  typeof x === "boolean"
    ? success(x)
    : failure(toError(toTypeMessage("boolean", typeof x)));

/**
 * Check if value is a valid date
 */
export const date: Guard<Date> = (x) => {
  if (!(x instanceof Date)) {
    return failure(toError(toTypeMessage("date", typeof x)));
  }

  if (!Number.isFinite(x.getTime())) {
    return failure(toError(`Expecting value to be a valid 'date'`));
  }

  return success(x);
};

/**
 * Check if value is an array of type T
 */
export const array =
  <T>(guard: Guard<T>): Guard<T[]> =>
  (x) => {
    if (!Array.isArray(x)) {
      return failure(toError(toTypeMessage("array", typeof x)));
    }

    const data: T[] = [];
    const errors: Err[] = [];

    for (let i = 0; i < x.length; i++) {
      const result = guard(x[i]);
      if (result.success) {
        data[i] = result.data;
      } else {
        errors.push(...mapErrorKey(result.errors, i));
      }
    }

    return toPayload(data, errors);
  };

/**
 * Check if value is an object with the specified shape
 */
export const object = <T extends Shape>(shape: T): Guard<Infer<T>> => {
  const entries = Object.entries(shape);

  return (x) => {
    if (!isPlainObject(x)) {
      return failure(toError(toTypeMessage("object", typeof x)));
    }

    const data = Object.create(null);
    const errors: Err[] = [];

    for (const [key, guard] of entries) {
      const result = guard(x[key]);
      if (result.success) {
        data[key] = result.data;
      } else {
        errors.push(...mapErrorKey(result.errors, key));
      }
    }

    return toPayload(data, errors);
  };
};

/**
 * Check if value is a literal
 */
export const literal = <T extends Literal>(constant: T): Guard<T> => {
  if (
    !(
      typeof constant === "string" ||
      typeof constant === "number" ||
      typeof constant === "boolean" ||
      constant === null
    )
  ) {
    throw new TypeError(
      `'constant' literal should be of type 'string | number | boolean | null'`,
    );
  }

  return (x) =>
    constant === x
      ? success(x as T)
      : failure(toError(`Expecting literal '${constant}'. Got '${x}'`));
};

/**
 * Check if value is of type T or null
 */
export const nullable =
  <T>(guard: Guard<T>): Guard<T | null> =>
  (x) =>
    x === null ? success(x) : guard(x);

/**
 * Check if value is of type T or undefined
 */
export const optional =
  <T>(guard: Guard<T>): Guard<T | undefined> =>
  (x) =>
    typeof x === "undefined" ? success(x) : guard(x);

/**
 * Check if value is an enum. This function expects a real TypeScript enum type
 */
export const enums = <T extends Enum>(e: T): Guard<T> => {
  const values = Object.values(e);
  return (x) => {
    if (!values.includes(x as any)) {
      return failure(
        toError(`Expecting value to be '${values.join(" | ")}'. Got '${x}'`),
      );
    }
    return success(x as T);
  };
};

/**
 * Check if value is a tuple
 */
export const tuple =
  <A extends Guard, B extends Guard[]>(
    ...guards: [A, ...B]
  ): Guard<[Infer<A>, ...InferTuple<B>]> =>
  (x): Result<[Infer<A>, ...InferTuple<B>]> => {
    if (!Array.isArray(x)) {
      return failure(toError(toTypeMessage("array", typeof x)));
    }

    if (x.length < guards.length) {
      return failure(
        toError(
          `Expecting 'array' to have at least '${guards.length}' items on it. Got '${x.length}'`,
        ),
      );
    }

    const data: any[] = [];
    const errors: Err[] = [];

    for (let i = 0; i < guards.length; i++) {
      const result = guards[i](x[i]);
      if (result.success) {
        data[i] = result.data;
      } else {
        errors.push(...mapErrorKey(result.errors, i));
      }
    }

    return toPayload(data, errors) as any;
  };

/**
 * Check if value is any of the specified types
 */
export const union =
  <A extends Guard, B extends Guard[]>(
    ...guards: [A, ...B]
  ): Guard<Infer<A> | InferTuple<B>[number]> =>
  (x): Result<Infer<A> | InferTuple<B>[number]> => {
    const errors: Err[] = [];

    for (const guard of guards) {
      const result = guard(x);
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
 */
export const any: Guard<any> = (x): any => success(x);

/**
 * Coerce first, then check if value is a string
 */
export const asString: Guard<string> = (x) => string(String(x));

/**
 * Coerce first, then check if value is a number
 */
export const asNumber: Guard<number> = (x) => number(Number(x));

/**
 * Coerce first, then check if value is a valid date
 */
export const asDate: Guard<Date> = (x) => {
  if (typeof x === "string" || typeof x === "number") {
    x = new Date(x);
  }
  return date(x);
};
