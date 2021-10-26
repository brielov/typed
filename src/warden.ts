import type {
  Enum,
  Err,
  Infer,
  InferTuple,
  Literal,
  Result,
  Shape,
  Type,
} from "./types";
import {
  failure,
  isPlainObject,
  mapErrorKey,
  success,
  toError,
  toMessage,
  toResult,
} from "./util";

/**
 * Check if value is a string
 */
export const string: Type<string> = (x) =>
  typeof x === "string"
    ? success(x)
    : failure(toError(toMessage("string", typeof x)));

/**
 * Check if value is a number
 */
export const number: Type<number> = (x) => {
  if (typeof x !== "number") {
    return failure(toError(toMessage("number", typeof x)));
  }

  if (!Number.isFinite(x)) {
    return failure(toError(`Expecting value to be a finite 'number'`));
  }

  return success(x);
};

/**
 * Check if value is a boolean
 */
export const boolean: Type<boolean> = (x) =>
  typeof x === "boolean"
    ? success(x)
    : failure(toError(toMessage("boolean", typeof x)));

/**
 * Check if value is a valid date
 */
export const date: Type<Date> = (x) => {
  if (!(x instanceof Date)) {
    return failure(toError(toMessage("date", typeof x)));
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
  <T>(type: Type<T>): Type<T[]> =>
  (x) => {
    if (!Array.isArray(x)) {
      return failure(toError(toMessage("array", typeof x)));
    }

    const data: T[] = [];
    const errors: Err[] = [];

    for (let i = 0; i < x.length; i++) {
      const result = type(x[i]);
      if (result.success) {
        data[i] = result.data;
      } else {
        errors.push(...mapErrorKey(result.errors, i));
      }
    }

    return toResult(data, errors);
  };

/**
 * Check if value is an object with the specified shape
 */
export const object = <T extends Shape>(shape: T): Type<Infer<T>> => {
  const entries = Object.entries(shape);

  return (x) => {
    if (!isPlainObject(x)) {
      return failure(toError(toMessage("object", typeof x)));
    }

    const data = Object.create(null);
    const errors: Err[] = [];

    for (const [prop, type] of entries) {
      const result = type(x[prop]);
      if (result.success) {
        data[prop] = result.data;
      } else {
        errors.push(...mapErrorKey(result.errors, prop));
      }
    }

    return toResult(data, errors);
  };
};

/**
 * Check if value is a literal
 */
export const literal = <T extends Literal>(constant: T): Type<T> => {
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
  <T>(type: Type<T>): Type<T | null> =>
  (x) =>
    x === null ? success(x) : type(x);

/**
 * Check if value is of type T or undefined
 */
export const optional =
  <T>(type: Type<T>): Type<T | undefined> =>
  (x) =>
    typeof x === "undefined" ? success(x) : type(x);

/**
 * Check if value is an enum. This function expects a real TypeScript enum type
 */
export const enums = <T extends Enum>(e: T): Type<T> => {
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
  <A extends Type, B extends Type[]>(
    ...types: [A, ...B]
  ): Type<[Infer<A>, ...InferTuple<B>]> =>
  (x): Result<[Infer<A>, ...InferTuple<B>]> => {
    if (!Array.isArray(x)) {
      return failure(toError(toMessage("array", typeof x)));
    }

    const data: any[] = [];
    const errors: Err[] = [];

    for (let i = 0; i < types.length; i++) {
      const result = types[i](x[i]);
      if (result.success) {
        data[i] = result.data;
      } else {
        errors.push(...mapErrorKey(result.errors, i));
      }
    }

    return toResult(data, errors) as any;
  };

/**
 * Check if value is any of the specified types
 */
export const union =
  <A extends Type, B extends Type[]>(
    ...types: [A, ...B]
  ): Type<Infer<A> | InferTuple<B>[number]> =>
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
 */
export const any: Type<any> = (x): any => success(x);

/**
 * Returns a default value when input is undefined
 */
export const defaulted =
  <T>(type: Type<T>, fallback: T): Type<T> =>
  (x) =>
    typeof x === "undefined" ? success(fallback) : type(x);

/**
 * Coerce first, then check if value is a string
 */
export const asString: Type<string> = (x) => string(String(x));

/**
 * Coerce first, then check if value is a number
 */
export const asNumber: Type<number> = (x) => number(Number(x));

/**
 * Coerce first, then check if value is a valid date
 */
export const asDate: Type<Date> = (x) => {
  if (typeof x === "string" || typeof x === "number") {
    x = new Date(x);
  }
  return date(x);
};
