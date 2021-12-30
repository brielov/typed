import { Err, Ok } from "rsts";

import type {
  Enum,
  Infer,
  InferTuple,
  Literal,
  PlainObject,
  Shape,
  Type,
  UnionToIntersection,
} from "./common";
import { TypeAggregateErr } from "./error";
import {
  getTypeOf,
  isPlainObject,
  map,
  mapErrorKey,
  toErr,
  toMismatchMsg,
} from "./util";

/**
 * Check wether a given value is of type string.
 *
 * @param value - The value to check.
 * @returns The result.
 * @since 1.0.0
 */
export const string: Type<string> = (x) =>
  typeof x === "string"
    ? Ok(x)
    : Err(toErr(toMismatchMsg("string", getTypeOf(x))));

/**
 * Check wether a given value is of type number.
 * It also makes sure that the value is a finite number.
 *
 * @param value - The value to check.
 * @returns The result.
 * @since 1.0.0
 */
export const number: Type<number> = (input) =>
  typeof input === "number"
    ? Number.isFinite(input)
      ? Ok(input)
      : Err(toErr(`Expecting value to be a finite 'number'.`))
    : Err(toErr(toMismatchMsg("number", getTypeOf(input))));

/**
 * Check wether a given value is of type boolean.
 *
 * @param value - The value to check.
 * @returns The result.
 * @since 1.0.0
 */
export const boolean: Type<boolean> = (input) =>
  typeof input === "boolean"
    ? Ok(input)
    : Err(toErr(toMismatchMsg("boolean", getTypeOf(input))));

/**
 * Check wether a given value is of type Date.
 * It also makes sure that the date is a valid.
 *
 * @param value - The value to check.
 * @returns The result.
 * @since 1.0.0
 */
export const date: Type<Date> = (input) =>
  input instanceof Date
    ? Number.isFinite(input.getTime())
      ? Ok(input)
      : Err(toErr(`Expecting value to be a valid 'date'.`))
    : Err(toErr(toMismatchMsg("date", getTypeOf(input))));

/**
 * Check wether a given value is a string and matches a given regular expression.
 *
 * @param regex - The regex to check against.
 * @returns The result.
 * @since 1.3.0
 */
export const regex = (regex: RegExp) =>
  map(string, (input) =>
    regex.test(input)
      ? Ok(input)
      : Err(toErr(`Expecting value to match '${regex.toString()}'.`)),
  );

/**
 * Create a new typed function that will check wether a given value is an array and every element of the array passes the given type.
 *
 * @example
 * ```ts
 * const arrayOfStrings = T.array(T.string)
 * arrayOfStrings(['hello', 'world']) // Ok
 * arrayOfStrings(['hello', 123]) // Err
 * ```
 *
 * @param type - The type of the items in the array.
 * @returns The new type.
 * @since 1.0.0
 */
export const array =
  <T>(type: Type<T>): Type<T[]> =>
  (input) => {
    if (!Array.isArray(input)) {
      return Err(toErr(toMismatchMsg("array", getTypeOf(input))));
    }
    const arr: T[] = [];
    const err = new TypeAggregateErr();

    input.forEach((value, i) =>
      type(value).match({
        Ok: (v) => arr.push(v),
        Err: (e) => err.errors.push(...mapErrorKey(i, ...e.errors)),
      }),
    );

    return err.errors.length > 0 ? Err(err) : Ok(arr);
  };

/**
 * Create a new typed function from a given shape.
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
 * @param shape - The shape of the object.
 * @returns The new type.
 * @since 1.0.0
 */
export const object = <T extends Shape>(shape: T): Type<Infer<T>> => {
  const entries = Object.entries(shape);
  return (x) => {
    if (!isPlainObject(x)) {
      return Err(toErr(toMismatchMsg("object", getTypeOf(x))));
    }
    const obj = Object.create(null);
    const err = new TypeAggregateErr();

    entries.forEach(([key, type]) =>
      type(x[key]).match({
        Ok: (v) => (obj[key] = v),
        Err: (e) => err.errors.push(...mapErrorKey(key, ...e.errors)),
      }),
    );

    return err.errors.length > 0 ? Err(err) : Ok(obj);
  };
};

/**
 * Create a new typed function from a given constant.
 * It ensures that the value is equal to the given constant.
 *
 * @example
 * ```ts
 * const constant = T.literal('hello')
 * constant('hello') // Ok
 * constant('world') // Err
 * ```
 *
 * @param value - The constant to check.
 * @returns The new type.
 * @since 1.0.0
 */
export const literal =
  <T extends Literal>(constant: T): Type<T> =>
  (x) =>
    constant === x
      ? Ok(x as T)
      : Err(toErr(`Expecting literal '${constant}'. Got '${x}'.`));

/**
 * Create a new typed function from a given type that will succeed if the value is null.
 *
 * @example
 * ```ts
 * const nullable = T.nullable(T.string)
 * nullable(null) // Ok
 * nullable('hello') // Ok
 * nullable(123) // Err
 * ```
 *
 * @param type - The type to check.
 * @returns The new type.
 * @since 1.0.0
 */
export const nullable =
  <T>(type: Type<T>): Type<T | null> =>
  (x) =>
    x === null ? Ok(x) : type(x);

/**
 * Create a new typed function from a given type that will succeed if the value is undefined.
 *
 * @example
 * ```ts
 * const optional = T.optional(T.string)
 * optional(undefined) // Ok
 * optional('hello') // Ok
 * optional(123) // Err
 * ```
 *
 * @param type - The type to check.
 * @returns The new type.
 * @since 1.0.0
 */
export const optional =
  <T>(type: Type<T>): Type<T | undefined> =>
  (x) =>
    typeof x === "undefined" ? Ok(x) : type(x);

/**
 * Create a new typed function from a given TypeScript Enum.
 *
 * @example
 * ```ts
 * enum Role {
 *   ADMIN,
 *   USER,
 * }
 *
 * const role = T.enums(Role)
 * role(Role.ADMIN) // Ok
 * role(Role.USER) // Ok
 * role(Role.GUEST) // Err
 * ```
 *
 * @param enumType - The enum to check.
 * @returns The new type.
 * @since 1.0.0
 */
export const enums = <T extends Enum, K extends keyof T>(e: T): Type<T[K]> => {
  const values = Object.values(e);
  return (x) =>
    values.includes(x as any)
      ? Ok(x as T[K])
      : Err(
          toErr(
            `Expecting value to be one of '${values.join(", ")}'. Got '${x}'.`,
          ),
        );
};

/**
 * Create a new typed function from a list of types.
 * A tuple is like a fixed length array and every item should be of the specified type.
 *
 * @example
 * ```ts
 * const tuple = T.tuple(T.string, T.number)
 * tuple(['hello', 123]) // Ok
 * tuple(['hello', 'world']) // Err
 * ```
 *
 * @param types - The types to check.
 * @returns The new type.
 * @since 1.0.0
 */
export const tuple =
  <A extends Type, B extends Type[]>(
    ...types: [A, ...B]
  ): Type<[Infer<A>, ...InferTuple<B>]> =>
  (x) => {
    if (!Array.isArray(x)) {
      return Err(toErr(toMismatchMsg("array", getTypeOf(x))));
    }

    const arr: any[] = [];
    const err = new TypeAggregateErr();

    types.forEach((type, i) =>
      type(x[i]).match({
        Ok: (v) => arr.push(v),
        Err: (e) => err.errors.push(...mapErrorKey(i, ...e.errors)),
      }),
    );

    return err.errors.length > 0 ? Err(err) : (Ok(arr) as any);
  };

/**
 * Create a new typed function from a list of types.
 * This function will succeed if the value is any of the given types.
 *
 * @example
 * ```ts
 * const anyOf = T.union(T.string, T.number, T.boolean)
 * anyOf('hello') // Ok
 * anyOf(123) // Ok
 * anyOf(true) // Ok
 * anyOf(null) // Err
 * ```
 * @param types - The types to check.
 * @returns The new type.
 * @since 1.0.0
 */
export const union =
  <A extends Type, B extends Type[]>(
    ...types: [A, ...B]
  ): Type<Infer<A> | InferTuple<B>[number]> =>
  (x) => {
    const err = new TypeAggregateErr();

    for (const type of types) {
      const res = type(x);
      if (res.isOk()) return res as any;
      err.errors.push(...res.unwrapErr().errors);
    }

    return Err(err);
  };

/**
 * Create a new typed function which combines multiple types into one.
 *
 * @example
 * ```ts
 * const a = T.object({ name: T.string  })
 * const b = T.object({ age: T.number})
 * const c = T.intersection(a, b)
 *
 * c({ name: 'hello', age: 123 }) // Ok
 * c({ name: 'hello', age: 'world' }) // Err
 * c({name: 'hello'}) // Err
 * ```
 *
 * @param types - The types to check.
 * @returns The new type.
 * @since 1.2.0
 */
export const intersection =
  <A extends Type<PlainObject>, B extends Type<PlainObject>[]>(
    ...types: [A, ...B]
  ): Type<Infer<A> & UnionToIntersection<InferTuple<B>[number]>> =>
  (x) => {
    const err = new TypeAggregateErr();
    const obj = Object.create(null);

    types.forEach((type) =>
      type(x).match({
        Ok: (v) => Object.assign(obj, v),
        Err: (e) => err.errors.push(...e.errors),
      }),
    );

    return err.errors.length > 0 ? Err(err) : Ok(obj);
  };

/**
 * A passthrough function which returns its input marked as any.
 * Do not use this unless you really need to, it defeats the purpose of this library.
 *
 * @since 1.0.0
 */
export const any: Type<any> = (x): any => Ok(x);

/**
 * Create a new typed function from a given type that will return a fallback value if the input value is undefined.
 *
 * @example
 * ```ts
 * const withFallback = T.defaulted(T.number, 0)
 * withFallback(undefined) // Ok(0)
 * withFallback(123) // Ok(123)
 * withFallback('hello') // Err
 * ```
 *
 * @param type - The type to check.
 * @param fallback - The fallback value.
 * @returns The new type.
 * @since 1.0.0
 */
export const defaulted =
  <T>(type: Type<T>, fallback: T): Type<T> =>
  (x) =>
    typeof x === "undefined" ? Ok(fallback) : type(x);

/**
 * Coerce first, then check if value is a string.
 *
 * @param x - The value to check.
 * @returns The result.
 * @since 1.0.0
 */
export const asString: Type<string> = (x) => string(String(x));

/**
 * Coerce first, then check if value is a number.
 *
 * @param x - The value to check.
 * @returns The result.
 * @since 1.0.0
 */
export const asNumber: Type<number> = (x) => number(Number(x));

/**
 * Coerce first, then check if value is a valid date.
 *
 * @param x - The value to check.
 * @returns The result.
 * @since 1.0.0
 */
export const asDate: Type<Date> = (x) =>
  date(typeof x === "string" || typeof x === "number" ? new Date(x) : x);
