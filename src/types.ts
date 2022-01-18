import type {
  Enum,
  Infer,
  InferTuple,
  Literal,
  PlainObject,
  Result,
  Shape,
  Type,
  UnionToIntersection,
  Err,
} from "./common";
import {
  err,
  getTypeOf,
  isPlainObject,
  map,
  mapErrorKey,
  ok,
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
export function string(x: any): Result<string> {
  if (typeof x === "string") return ok(x);
  return err(toErr(toMismatchMsg("string", getTypeOf(x))));
}

/**
 * Check wether a given value is of type number.
 * It also makes sure that the value is a finite number.
 *
 * @param value - The value to check.
 * @returns The result.
 * @since 1.0.0
 */
export function number(x: any): Result<number> {
  if (typeof x !== "number")
    return err(toErr(toMismatchMsg("number", getTypeOf(x))));
  if (!Number.isFinite(x))
    return err(toErr(`Expecting value to be a finite 'number'.`));
  return ok(x);
}

/**
 * Check wether a given value is of type boolean.
 *
 * @param value - The value to check.
 * @returns The result.
 * @since 1.0.0
 */
export function boolean(x: any): Result<boolean> {
  if (typeof x === "boolean") return ok(x);
  return err(toErr(toMismatchMsg("boolean", getTypeOf(x))));
}

/**
 * Check wether a given value is of type Date.
 * It also makes sure that the date is a valid.
 *
 * @param value - The value to check.
 * @returns The result.
 * @since 1.0.0
 */
export function date(x: any): Result<Date> {
  if (!(x instanceof Date))
    return err(toErr(toMismatchMsg("date", getTypeOf(x))));
  if (!Number.isFinite(x.getDate()))
    return err(toErr(`Expecting date to be valid.`));
  return ok(x);
}

/**
 * Check wether a given value is a string and matches a given regular expression.
 *
 * @param regex - The regex to check against.
 * @returns The result.
 * @since 1.3.0
 */
export function regex(regex: RegExp) {
  return map(string, function (input) {
    return regex.test(input)
      ? ok(input)
      : err(toErr(`Expecting value to match '${regex.toString()}'.`));
  });
}

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
export function array<T>(type: Type<T>): Type<T[]> {
  return function (x: any) {
    if (!Array.isArray(x))
      return err(toErr(toMismatchMsg("array", getTypeOf(x))));

    const arr: T[] = [];
    const errors: Err[] = [];

    for (let i = 0; i < x.length; i++) {
      const result = type(x[i]);
      if (result.ok) {
        arr.push(result.data);
      } else {
        errors.push(...mapErrorKey(i, ...result.errors));
      }
    }

    return errors.length ? err(...errors) : ok(arr);
  };
}

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
export function object<T extends Shape>(shape: T): Type<Infer<T>> {
  const entries = Object.entries(shape);
  return function (x: any) {
    if (!isPlainObject(x))
      return err(toErr(toMismatchMsg("object", getTypeOf(x))));
    const obj = Object.create(null);
    const errors: Err[] = [];

    for (let i = 0; i < entries.length; i++) {
      const [key, type] = entries[i];
      const result = type(x[key]);
      if (result.ok) {
        obj[key] = result.data;
      } else {
        errors.push(...mapErrorKey(key, ...result.errors));
      }
    }
    return errors.length ? err(...errors) : ok(obj);
  };
}

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
export function literal<T extends Literal>(constant: T): Type<T> {
  return function (x: any) {
    return constant === x
      ? ok(x)
      : err(toErr(`Expecting literal '${constant}'. Got '${x}'.`));
  };
}

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
export function nullable<T>(type: Type<T>): Type<T | null> {
  return function (x: any) {
    return x === null ? ok(x) : type(x);
  };
}

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
export function optional<T>(type: Type<T>): Type<T | undefined> {
  return function (x: any) {
    return typeof x === "undefined" ? ok(x) : type(x);
  };
}

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
export function enums<T extends Enum, K extends keyof T>(e: T): Type<T[K]> {
  const values = Object.values(e);
  return function (x: any) {
    return values.includes(x as any)
      ? ok(x)
      : err(
          toErr(
            `Expecting value to be one of '${values.join(", ")}'. Got '${x}'.`,
          ),
        );
  };
}

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
export function tuple<A extends Type, B extends Type[]>(
  ...types: [A, ...B]
): Type<[Infer<A>, ...InferTuple<B>]> {
  return function (x: any) {
    if (!Array.isArray(x))
      return err(toErr(toMismatchMsg("array", getTypeOf(x))));
    const arr: any[] = [];
    const errors: Err[] = [];

    for (let i = 0; i < types.length; i++) {
      const result = types[i](x[i]);
      if (result.ok) {
        arr.push(result.data);
      } else {
        errors.push(...mapErrorKey(i, ...result.errors));
      }
    }

    return errors.length ? err(...errors) : ok(arr as any);
  };
}

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
export function union<A extends Type, B extends Type[]>(
  ...types: [A, ...B]
): Type<Infer<A> | InferTuple<B>[number]> {
  return function (x: any) {
    const errors: Err[] = [];
    for (let i = 0; i < types.length; i++) {
      const result = types[i](x);
      if (result.ok) {
        return result as any;
      }
      errors.push(...result.errors);
    }
    return err(...errors);
  };
}

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
export function intersection<
  A extends Type<PlainObject>,
  B extends Type<PlainObject>[],
>(
  ...types: [A, ...B]
): Type<Infer<A> & UnionToIntersection<InferTuple<B>[number]>> {
  return function (x: any) {
    const obj = Object.create(null);
    const errors: Err[] = [];

    for (let i = 0; i < types.length; i++) {
      const result = types[i](x);
      if (result.ok) {
        Object.assign(obj, result.data);
      } else {
        errors.push(...result.errors);
      }
    }

    return errors.length ? err(...errors) : ok(obj);
  };
}

/**
 * A passthrough function which returns its input marked as any.
 * Do not use this unless you really need to, it defeats the purpose of this library.
 *
 * @since 1.0.0
 */
export function any(x: any): Result<any> {
  return ok(x);
}

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
export function defaulted<T>(type: Type<T>, fallback: T): Type<T> {
  return function (x: any) {
    return typeof x === "undefined" ? ok(fallback) : type(x);
  };
}

/**
 * Coerce first, then check if value is a string.
 *
 * @param x - The value to check.
 * @returns The result.
 * @since 1.0.0
 */
export function asString(x: any) {
  return string(String(x));
}

/**
 * Coerce first, then check if value is a number.
 *
 * @param x - The value to check.
 * @returns The result.
 * @since 1.0.0
 */
export function asNumber(x: any) {
  return number(Number(x));
}

/**
 * Coerce first, then check if value is a valid date.
 *
 * @param x - The value to check.
 * @returns The result.
 * @since 1.0.0
 */
export function asDate(x: any) {
  if (typeof x === "string" || typeof x === "number") return date(new Date(x));
  return date(x);
}
