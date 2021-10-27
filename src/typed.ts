import type {
  Enum,
  Err,
  Infer,
  InferTuple,
  Literal,
  Result,
  Shape,
  Typed,
} from "./typings";
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
 * Check if value is a string
 */
export const string: Typed<string> = (x) =>
  typeof x === "string"
    ? success(x)
    : failure(toError(toMessage("string", getTypeOf(x))));

/**
 * Check if value is a number
 */
export const number: Typed<number> = (x) =>
  typeof x !== "number"
    ? failure(toError(toMessage("number", getTypeOf(x))))
    : !Number.isFinite(x)
    ? failure(toError(`Expecting value to be a finite 'number'`))
    : success(x);

/**
 * Check if value is a boolean
 */
export const boolean: Typed<boolean> = (x) =>
  typeof x === "boolean"
    ? success(x)
    : failure(toError(toMessage("boolean", getTypeOf(x))));

/**
 * Check if value is a valid date
 */
export const date: Typed<Date> = (x) =>
  !(x instanceof Date)
    ? failure(toError(toMessage("date", getTypeOf(x))))
    : !Number.isFinite(x.getTime())
    ? failure(toError(`Expecting value to be a valid 'date'`))
    : success(x);

/**
 * Check if value is an array of type T
 */
export const array =
  <T>(type: Typed<T>): Typed<T[]> =>
  (x) => {
    if (!Array.isArray(x)) {
      return failure(toError(toMessage("array", getTypeOf(x))));
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
export const object = <T extends Shape>(shape: T): Typed<Infer<T>> => {
  // Cache shape entries
  const entries = Object.entries(shape);

  return (x) => {
    if (!isPlainObject(x)) {
      return failure(toError(toMessage("object", getTypeOf(x))));
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
export const literal = <T extends Literal>(constant: T): Typed<T> => {
  if (
    !(
      typeof constant === "string" ||
      typeof constant === "number" ||
      typeof constant === "boolean" ||
      constant === null
    )
  ) {
    throw new TypeError(
      `'constant' literal should be of type 'string | number | boolean | null'. Got '${getTypeOf(
        constant,
      )}'`,
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
  <T>(type: Typed<T>): Typed<T | null> =>
  (x) =>
    x === null ? success(x) : type(x);

/**
 * Check if value is of type T or undefined
 */
export const optional =
  <T>(type: Typed<T>): Typed<T | undefined> =>
  (x) =>
    typeof x === "undefined" ? success(x) : type(x);

/**
 * Check if value is an enum. This function expects a real TypeScript enum type
 */
export const enums = <T extends Enum>(e: T): Typed<T> => {
  // Cache enum values
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
  <A extends Typed, B extends Typed[]>(
    ...types: [A, ...B]
  ): Typed<[Infer<A>, ...InferTuple<B>]> =>
  (x): Result<[Infer<A>, ...InferTuple<B>]> => {
    if (!Array.isArray(x)) {
      return failure(toError(toMessage("array", getTypeOf(x))));
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
 */
export const any: Typed<any> = (x): any => success(x);

/**
 * Returns a default value when input is undefined
 */
export const defaulted =
  <T>(type: Typed<T>, fallback: T): Typed<T> =>
  (x) =>
    typeof x === "undefined" ? success(fallback) : type(x);

/**
 * Coerce first, then check if value is a string
 */
export const asString: Typed<string> = (x) => string(String(x));

/**
 * Coerce first, then check if value is a number
 */
export const asNumber: Typed<number> = (x) => number(Number(x));

/**
 * Coerce first, then check if value is a valid date
 */
export const asDate: Typed<Date> = (x) => {
  if (typeof x === "string" || typeof x === "number") {
    x = new Date(x);
  }
  return date(x);
};
