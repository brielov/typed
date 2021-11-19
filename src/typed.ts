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
 * Creates a new type from a given base type.
 * It ensures that the base type passes validation before carrying on.
 *
 * @example
 * ```ts
 * const emailType = T.map(T.string, (value) =>
 *  EMAIL_REGEX.test(value)
 *    ? T.success(value)
 *    : T.failure(T.toError('Expecting string to be a valid email address'))
 * )
 * ```
 *
 * @template I, O
 * @param {Typed<I>} base - The base type.
 * @param {(value: I) => Result<O, Err>} onSuccess - The mapping function.
 * @returns {Typed<O>}
 * @since 1.0.0
 */
export const map =
  <I, O>(base: Typed<I>, onSuccess: (value: I) => Result<O>): Typed<O> =>
  (x) => {
    const result = base(x);
    return result.success ? onSuccess(result.value) : result;
  };

/**
 * Check wether a given value is of type string.
 *
 * @param {*} value - The value to check.
 * @returns {Result<string>}
 * @since 1.0.0
 */
export const string: Typed<string> = (x) =>
  typeof x === "string"
    ? success(x)
    : failure(toError(toMessage("string", getTypeOf(x))));

/**
 * Check wether a given value is of type number.
 * It also makes sure that the value is a finite number.
 *
 * @param {*} value - The value to check.
 * @returns {Result<number>}
 * @since 1.0.0
 */
export const number: Typed<number> = (x) =>
  typeof x === "number"
    ? Number.isFinite(x)
      ? success(x)
      : failure(toError(`Expecting value to be a finite 'number'`))
    : failure(toError(toMessage("number", getTypeOf(x))));

/**
 * Check wether a given value is of type boolean.
 *
 * @param {*} value - The value to check.
 * @returns {Result<boolean>}
 * @since 1.0.0
 */
export const boolean: Typed<boolean> = (x) =>
  typeof x === "boolean"
    ? success(x)
    : failure(toError(toMessage("boolean", getTypeOf(x))));

/**
 * Check weather a given value is of type Date.
 * It also makes sure that the value is a valid date.
 *
 * @param {*} value - The value to check.
 * @returns {Result<Date>}
 * @since 1.0.0
 */
export const date: Typed<Date> = (x) =>
  x instanceof Date
    ? Number.isFinite(x.getTime())
      ? success(x)
      : failure(toError(`Expecting value to be a valid 'date'`))
    : failure(toError(toMessage("date", getTypeOf(x))));

/**
 * Creates a new typed function from a given base type.
 * It ensures that value is an array and every item is of base type.
 *
 * @example
 * ```ts
 * const arrayOfStrings = T.array(T.string)
 * arrayOfStrings(['hello', 'world']) // success
 * arrayOfStrings(['hello', 123]) // failure
 * ```
 *
 * @template T
 * @param {Typed<T>} type - The type that every item should be of.
 * @returns {Typed<T[]>}
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
 * Creates a new typed function from a given shape.
 * The shape can be as deep as needed.
 *
 * @example
 * ```ts
 * const postType = T.object({
 *   title: T.string,
 *   body: T.string,
 *   tags: T.array(T.string),
 *   author: T.object({
 *     name: T.string,
 *   })
 * })
 * ```
 *
 * @param {Shape} shape - The shape to check.
 * @returns {Typed<Infer<Shape>>}
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
 * Creates a new typed function from a given constant.
 * It ensures that the value is equal to the given constant.
 *
 * @example
 * ```ts
 * const constant = T.literal('hello')
 * constant('hello') // success
 * constant('world') // failure
 * ```
 *
 * @template T
 * @param {*} value - The constant to check.
 * @returns {Typed<T>}
 * @since 1.0.0
 */
export const literal =
  <T extends Literal>(constant: T): Typed<T> =>
  (x) =>
    constant === x
      ? success(x as T)
      : failure(toError(`Expecting literal '${constant}'. Got '${x}'`));

/**
 * Creates a new typed function from a given type that will succeed if the value is null.
 *
 * @example
 * ```ts
 * const nullable = T.nullable(T.string)
 * nullable(null) // success
 * nullable('hello') // success
 * nullable(123) // failure
 * ```
 *
 * @template T
 * @param {Typed<T>} type - The type to check.
 * @returns {Typed<T | null>}
 * @since 1.0.0
 */
export const nullable =
  <T>(type: Typed<T>): Typed<T | null> =>
  (x) =>
    x === null ? success(x) : type(x);

/**
 * Creates a new typed function from a given type that will succeed if the value is undefined.
 *
 * @example
 * ```ts
 * const optional = T.optional(T.string)
 * optional(undefined) // success
 * optional('hello') // success
 * optional(123) // failure
 * ```
 *
 * @template T
 * @param {Typed<T>} type - The type to check.
 * @returns {Typed<T | undefined>}
 * @since 1.0.0
 */
export const optional =
  <T>(type: Typed<T>): Typed<T | undefined> =>
  (x) =>
    typeof x === "undefined" ? success(x) : type(x);

/**
 * Creates a new typed function from a given TypeScript Enum.
 *
 * @example
 * ```ts
 * enum Role {
 *   ADMIN,
 *   USER,
 * }
 *
 * const role = T.enums(Role)
 * role(Role.ADMIN) // success
 * role(Role.USER) // success
 * role(Role.GUEST) // failure
 * ```
 *
 * @template T, K
 * @param {Enum} enumType - The enum to check.
 * @returns {Typed<T[K]>}
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
 * Creates a new typed function from a list of types.
 * A tuple is like a fixed length array and every item should be of the specified type.
 *
 * @example
 * ```ts
 * const tuple = T.tuple(T.string, T.number)
 * tuple(['hello', 123]) // success
 * tuple(['hello', 'world']) // failure
 * ```
 *
 * @template A, B
 * @param {Typed, ...Typed[]}
 * @returns {Typed<[Infer<A>, ...InferTuple<B>]>}
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
 * Creates a new typed function from a list of types.
 * This function will succeed if the value is any of the given types.
 *
 * @example
 * ```ts
 * const anyOf = T.union(T.string, T.number, T.boolean)
 * anyOf('hello') // success
 * anyOf(123) // success
 * anyOf(true) // success
 * anyOf(null) // failure
 * ```
 * @template A, B
 * @param {Typed, ...Typed[]}
 * @returns {Typed<Infer<A> | ...InferTuple<B>[number]}
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
 * Creates a new typed function from a given type that will return a fallback if the value is undefined.
 *
 * @example
 * ```ts
 * const withFallback = T.defaulted(T.number, 0)
 * withFallback(undefined) // success(0)
 * withFallback(123) // success(123)
 * withFallback('hello') // failure
 * ```
 *
 * @template T
 * @param {Typed<T>} type - The type to check.
 * @param {T} fallback - The fallback value.
 * @returns {Typed<T>}
 * @since 1.0.0
 */
export const defaulted =
  <T>(type: Typed<T>, fallback: T): Typed<T> =>
  (x) =>
    typeof x === "undefined" ? success(fallback) : type(x);

/**
 * Coerce first, then check if value is a string.
 *
 * @returns {Typed<string>}
 * @since 1.0.0
 */
export const asString: Typed<string> = (x) => string(String(x));

/**
 * Coerce first, then check if value is a number.
 * @returns {Typed<number>}
 * @since 1.0.0
 */
export const asNumber: Typed<number> = (x) => number(Number(x));

/**
 * Coerce first, then check if value is a valid date.
 * @returns {Typed<Date>}
 * @since 1.0.0
 */
export const asDate: Typed<Date> = (x) =>
  date(typeof x === "string" || typeof x === "number" ? new Date(x) : x);
