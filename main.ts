export type Ok<T> = { readonly ok: true; readonly value: T };
export type Err<E> = { readonly ok: false; readonly error: E };
export type Result<T, E> = Ok<T> | Err<E>;

export const Ok = <T,>(value: T): Ok<T> => ({ ok: true, value });
export const Err = <E,>(error: E): Err<E> => ({ ok: false, error });

export type ParseError = {
  path: string[];
  message: string;
  input: unknown;
};

export type Infer<T> = T extends Schema<infer U> ? U : never;

type InferTuple<T> = T extends [Schema<infer U>, ...infer Rest]
  ? [U, ...InferTuple<Rest>]
  : [];

// deno-lint-ignore ban-types
type Pretty<T> = { [K in keyof T]: T[K] } & {};

// deno-lint-ignore no-explicit-any
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I extends PlainObject,
) => void
  ? I
  : never;

type PlainObject = { [key: PropertyKey]: unknown };

const fail = (message: string, input: unknown): Err<ParseError> =>
  Err({
    path: [],
    message,
    input,
  });

const isNil = (input: unknown): input is null | undefined =>
  typeof input === "undefined" || input === null;

const isPlainObject = (input: unknown): input is PlainObject => {
  if (isNil(input)) return false;
  const proto = Object.getPrototypeOf(input);
  return proto === null || proto === Object.prototype;
};

export interface Schema<T> {
  name: string;
  parse(input: unknown): Result<T, ParseError>;
}

type Shape<T extends PlainObject> = { [K in keyof T]: Schema<T[K]> };

export interface ObjectSchema<T extends PlainObject> extends Schema<T> {
  shape: Shape<T>;
}

/**
 * Creates a schema for validating strings.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for strings.
 */
export const str = (message = "Expected string"): Schema<string> => ({
  name: "string",
  parse: (input) =>
    typeof input === "string" ? Ok(input) : fail(message, input),
});

/**
 * Creates a schema for validating numbers.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for numbers.
 */
export const num = (message = "Expected number"): Schema<number> => ({
  name: "number",
  parse: (input) =>
    typeof input === "number" && Number.isFinite(input)
      ? Ok(input)
      : fail(message, input),
});

/**
 * Creates a schema for validating booleans.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for booleans.
 */
export const bool = (message = "Expected boolean"): Schema<boolean> => ({
  name: "boolean",
  parse: (input) =>
    typeof input === "boolean" ? Ok(input) : fail(message, input),
});

/**
 * Creates a schema for validating dates.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for dates.
 */
export const date = (message = "Expected date"): Schema<Date> => ({
  name: "date",
  parse: (input) =>
    input instanceof Date && Number.isFinite(input.getTime())
      ? Ok(new Date(input))
      : fail(message, input),
});

/**
 * Creates a schema for validating arrays.
 * @param schema - The schema to apply to each element of the array.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for arrays.
 */
export const vec = <T,>(
  schema: Schema<T>,
  message = "Expected array",
): Schema<T[]> => ({
  ...schema,
  name: `array<${schema.name}>`,
  parse: (input) => {
    if (!Array.isArray(input)) return fail(message, input);
    const arr = Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const result = schema.parse(input[i]);
      if (!result.ok) {
        result.error.path.unshift(i.toString());
        return result;
      }
      arr[i] = result.value;
    }
    return Ok(arr);
  },
});

/**
 * Creates a schema for validating objects with a specific shape.
 * @param shape - The shape of the object, where each key is associated with a schema.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for objects with a specified shape.
 */
export const struct = <T extends PlainObject>(
  shape: Shape<T>,
  message = "Expected object",
): ObjectSchema<T> => ({
  shape,
  name: "object",
  parse: (input) => {
    if (!isPlainObject(input)) return fail(message, input);
    const obj = Object.create(null);
    for (const key in shape) {
      const result = shape[key].parse(input[key]);
      if (!result.ok) {
        result.error.path.unshift(key);
        return result;
      }
      obj[key] = result.value;
    }
    return Ok(obj);
  },
});

/**
 * Creates a schema for values that can be either of the specified type or null/undefined.
 * @param schema - The original schema.
 * @returns A schema for values that can be either of the specified type or null/undefined.
 */
export const maybe = <T,>(schema: Schema<T>): Schema<T | null | undefined> => ({
  ...schema,
  parse: (input) => (isNil(input) ? Ok(input) : schema.parse(input)),
});

type GetValue<T> = T | (() => T);

type AnyFunc = (...args: unknown[]) => unknown;

const isFunction = (input: unknown): input is AnyFunc =>
  typeof input === "function";

/**
 * Creates a schema with a default value.
 * If the input is null or undefined, the default value is used.
 * @param schema - The original schema.
 * @param fallback - The default value to use when the input is null or undefined.
 * @returns A new schema with default value handling.
 */
export const withDefault = <T,>(
  schema: Schema<T>,
  fallback: GetValue<T>,
): Schema<T> => ({
  ...schema,
  parse: (input) => {
    if (isNil(input)) {
      const defaultValue = isFunction(fallback) ? fallback() : fallback;
      return Ok(defaultValue);
    }
    return schema.parse(input);
  },
});

/**
 * Creates a schema that allows values conforming to any of the specified schemas.
 * @param schemas - An array of schemas.
 * @param message - Custom error message to be used when none of the schemas match.
 * @returns A schema that allows values conforming to any of the specified schemas.
 */
export const either = <A extends Schema<unknown>, B extends Schema<unknown>[]>(
  schemas: [A, ...B],
  message = `Expected either ${schemas.map((s) => s.name).join(" | ")}`,
): Schema<Infer<A> | Infer<B[number]>> => ({
  name: `${schemas.map((s) => s.name).join(" | ")}`,
  parse: (input) => {
    for (const schema of schemas) {
      const result = schema.parse(input);
      // deno-lint-ignore no-explicit-any
      if (result.ok) return result as any;
    }
    return fail(message, input);
  },
});

/**
 * Extends multiple object schemas into a new object schema with a merged shape.
 * @param schemas - An array of object schemas to extend.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A new object schema with a merged shape.
 */
export const extend = <
  A extends ObjectSchema<PlainObject>,
  B extends ObjectSchema<PlainObject>[],
>(
  schemas: [A, ...B],
  message?: string,
): ObjectSchema<Pretty<UnionToIntersection<Infer<A> | Infer<B[number]>>>> => {
  const newShape = Object.assign({}, ...schemas.map((s) => s.shape));
  return struct(newShape, message);
};

/**
 * Creates a schema for validating arrays with a specified tuple structure.
 * @param schemas - An array of schemas, each corresponding to an element in the tuple.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for validating arrays with a specified tuple structure.
 */
export const tuple = <A extends Schema<unknown>, B extends Schema<unknown>[]>(
  schemas: [A, ...B],
  message = `Expected array`,
): Schema<InferTuple<[A, ...B]>> => ({
  name: `[${schemas.map((s) => s.name).join(", ")}]`,
  parse: (input) => {
    if (!Array.isArray(input)) return fail(message, input);
    const arr = Array(schemas.length);
    for (let i = 0; i < schemas.length; i++) {
      const result = schemas[i].parse(input[i]);
      if (!result.ok) {
        result.error.path.unshift(i.toString());
        return result;
      }
      arr[i] = result.value;
    }
    // deno-lint-ignore no-explicit-any
    return Ok(arr as any);
  },
});

/**
 * Creates a schema for validating objects with a subset of keys.
 * @param schema - The original object schema.
 * @param keys - An array of keys to include in the subset.
 * @returns A schema for objects with a subset of keys.
 */
export const pick = <T extends PlainObject, K extends keyof T>(
  schema: ObjectSchema<T>,
  keys: readonly K[],
): ObjectSchema<Pretty<Pick<T, K>>> => {
  const newShape = Object.create(null);
  for (const key in schema.shape) {
    if (keys.includes(key as unknown as K)) {
      newShape[key] = schema.shape[key];
    }
  }
  return struct(newShape);
};

/**
 * Creates a schema for validating objects with certain keys omitted.
 * @param schema - The original object schema.
 * @param keys - An array of keys to omit from the object.
 * @returns A schema for objects with specified keys omitted.
 */
export const omit = <T extends PlainObject, K extends keyof T>(
  schema: ObjectSchema<T>,
  keys: readonly K[],
): ObjectSchema<Pretty<Omit<T, K>>> => {
  const newShape = Object.create(null);
  for (const key in schema.shape) {
    if (!keys.includes(key as unknown as K)) {
      newShape[key] = schema.shape[key];
    }
  }
  return struct(newShape);
};

/**
 * Creates a schema for transforming values using a provided function.
 * @param schema - The original schema.
 * @param f - The function to transform the value.
 * @returns A schema for transformed values.
 */
export const transform = <T, U>(
  schema: Schema<T>,
  f: (value: T) => U,
): Schema<U> => ({
  ...schema,
  parse: (input) => {
    const result = schema.parse(input);
    if (!result.ok) return result;
    return Ok(f(result.value));
  },
});

/**
 * Creates a schema for validating values based on a custom condition.
 * @param schema - The original schema.
 * @param f - The condition function. Should return true if the value is valid.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for values meeting a custom condition.
 */
export const refine = <T,>(
  schema: Schema<T>,
  f: (value: T) => boolean,
  message: string,
): Schema<T> => ({
  ...schema,
  parse: (input) => {
    const result = schema.parse(input);
    if (!result.ok) return result;
    const { value } = result;
    if (!f(value)) return fail(message, value);
    return Ok(value);
  },
});

/**
 * Creates a schema for coercing values to a specified type.
 * Supports coercion to string, number, boolean, and Date types.
 * @param schema - The original schema.
 * @returns A schema for values coerced to the specified type.
 * @throws {Error} If the specified schema type cannot be coerced.
 */
export const coerce = <T extends string | number | boolean | Date>(
  schema: Schema<T>,
): Schema<T> => {
  // deno-lint-ignore no-explicit-any
  let fn!: (input: any) => any;

  switch (schema.name) {
    case "string":
      fn = String;
      break;
    case "number":
      fn = Number;
      break;
    case "boolean":
      fn = (input) =>
        typeof input === "string"
          ? ["on", "yes", "true"].includes(input.trim().toLowerCase())
          : Boolean(input);
      break;
    case "date":
      fn = (input) =>
        typeof input === "string" || typeof input === "number"
          ? new Date(input)
          : input;
      break;
  }

  if (typeof fn === "undefined") {
    throw new Error(`Schema "${schema.name}" cannot be coerced`);
  }

  return {
    ...schema,
    parse: (input) => schema.parse(fn(input)),
  };
};

/**
 * Parses an unknown input using the specified schema, throwing an error if the validation fails.
 * @param schema - The schema to use for parsing.
 * @param input - The input to parse.
 * @returns The parsed value.
 * @throws {Error} If the input does not match the schema.
 */
export const unsafeParse = <T,>(schema: Schema<T>, input: unknown): T => {
  const result = schema.parse(input);
  if (!result.ok) {
    throw new Error(result.error.message);
  }
  return result.value;
};

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

/**
 * Creates a schema for validating email addresses.
 * @param schema - The original schema.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for validating email addresses.
 */
export const email = <T extends string>(
  schema: Schema<T>,
  message = `Expected valid email address`,
) => refine(schema, (s) => EMAIL_REGEX.test(s), message);

const UUID_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;

/**
 * Validates that a string is a valid UUID.
 * @param schema - The original schema for a string.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A new schema for UUID validation.
 */
export const uuid = <T extends string>(
  schema: Schema<T>,
  message = "Expected valid uuid",
): Schema<T> => refine(schema, (s) => UUID_REGEX.test(s), message);

/**
 * Creates a schema for validating that a number is an integer.
 * @param schema - The original schema.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for validating integers.
 */
export const int = <T extends number>(
  schema: Schema<T>,
  message = "Expected number to be an integer",
) => refine(schema, (x) => Number.isInteger(x), message);

/**
 * Creates a schema for validating that a number is positive.
 * @param schema - The original schema.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for validating positive numbers.
 */
export const positive = <T extends number>(
  schema: Schema<T>,
  message = "Expected number to be positive",
) => refine(schema, (x) => x > 0, message);

/**
 * Creates a schema for validating that a number is negative.
 * @param schema - The original schema.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for validating negative numbers.
 */
export const negative = <T extends number>(
  schema: Schema<T>,
  message = "Expected number to be negative",
) => refine(schema, (x) => x < 0, message);

/**
 * Creates a schema for clamping a number within a specified range.
 * @param schema - The original schema.
 * @param min - The minimum value of the range.
 * @param max - The maximum value of the range.
 * @returns A schema for clamped numbers.
 */
export const clamp = <T extends number>(
  schema: Schema<T>,
  min: number,
  max: number,
) => transform(schema, (x) => Math.min(Math.max(x, min), max));

const toComparableInt = (input: number | string | Date) => {
  if (typeof input === "string") return input.length;
  if (typeof input === "number") return input;
  return input.getTime();
};

/**
 * Creates a schema for validating that a numeric value is greater than or equal to a specified minimum.
 * @param schema - The original schema.
 * @param value - The minimum value to compare against.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for validating minimum values.
 */
export function min(
  schema: Schema<number>,
  value: number,
  message?: string,
): Schema<number>;

/**
 * Creates a schema for validating that a string length or date is greater than or equal to a specified minimum.
 * @param schema - The original schema.
 * @param value - The minimum value to compare against.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for validating minimum values.
 */
export function min(
  schema: Schema<string>,
  value: number,
  message?: string,
): Schema<string>;

/**
 * Creates a schema for validating that a date is greater than or equal to a specified minimum date.
 * @param schema - The original schema.
 * @param value - The minimum date value to compare against.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for validating minimum date values.
 */
export function min(
  schema: Schema<Date>,
  value: Date,
  message?: string,
): Schema<Date>;

/**
 * Creates a schema for validating that a value is greater than or equal to a specified minimum.
 * @param schema - The original schema.
 * @param value - The minimum value or date to compare against.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for validating minimum values.
 */
export function min(
  // deno-lint-ignore no-explicit-any
  schema: Schema<any>,
  value: number | Date,
  message = `Expected value to be at least ${value}`,
) {
  return refine(
    schema,
    (x) => toComparableInt(x) >= toComparableInt(value),
    message,
  );
}

/**
 * Creates a schema for validating that a numeric value is less than or equal to a specified maximum.
 * @param schema - The original schema.
 * @param value - The maximum value to compare against.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for validating maximum values.
 */
export function max(
  schema: Schema<number>,
  value: number,
  message?: string,
): Schema<number>;

/**
 * Creates a schema for validating that a string length or date is less than or equal to a specified maximum.
 * @param schema - The original schema.
 * @param value - The maximum value to compare against.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for validating maximum values.
 */
export function max(
  schema: Schema<string>,
  value: number,
  message?: string,
): Schema<string>;

/**
 * Creates a schema for validating that a date is less than or equal to a specified maximum date.
 * @param schema - The original schema.
 * @param value - The maximum date value to compare against.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for validating maximum date values.
 */
export function max(
  schema: Schema<Date>,
  value: Date,
  message?: string,
): Schema<Date>;

/**
 * Creates a schema for validating that a value is less than or equal to a specified maximum.
 * @param schema - The original schema.
 * @param value - The maximum value or date to compare against.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for validating maximum values.
 */
export function max(
  // deno-lint-ignore no-explicit-any
  schema: Schema<any>,
  value: number | Date,
  message = `Expected value to be at most ${value}`,
) {
  return refine(
    schema,
    (x) => toComparableInt(x) <= toComparableInt(value),
    message,
  );
}

/**
 * Creates a schema that accepts any value and marks it as unknown.
 * @returns A schema for any unknown value.
 */
export const unknown = (): Schema<unknown> => ({
  name: "unknown",
  parse: Ok,
});

/**
 * Creates a schema for validating values that must be equal to a specified literal constant.
 * @param constant - The literal constant value that input must match.
 * @param message - Custom error message to be used when the validation fails.
 * @returns A schema for validating literal constants.
 * @template T - The type of the literal constant.
 */
export const literal = <T extends number | string | boolean | null>(
  constant: T,
  message = `Expected value to be ${constant}`,
): Schema<T> => ({
  name: "literal",
  parse: (input) =>
    Object.is(constant, input) ? Ok(input as T) : fail(message, input),
});
