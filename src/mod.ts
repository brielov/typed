type Ok<T> = { readonly ok: true; readonly value: T };
type Err<E> = { readonly ok: false; readonly error: E };
type Result<T, E> = Ok<T> | Err<E>;

const Ok = <T,>(value: T): Ok<T> => ({ ok: true, value });
const Err = <E,>(error: E): Err<E> => ({ ok: false, error });

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

export const str = (message = "Expected string"): Schema<string> => ({
  name: "string",
  parse: (input) =>
    typeof input === "string" ? Ok(input) : fail(message, input),
});

export const num = (message = "Expected number"): Schema<number> => ({
  name: "number",
  parse: (input) =>
    typeof input === "number" && Number.isFinite(input)
      ? Ok(input)
      : fail(message, input),
});

export const bool = (message = "Expected boolean"): Schema<boolean> => ({
  name: "boolean",
  parse: (input) =>
    typeof input === "boolean" ? Ok(input) : fail(message, input),
});

export const date = (message = "Expected date"): Schema<Date> => ({
  name: "date",
  parse: (input) =>
    input instanceof Date && Number.isFinite(input.getTime())
      ? Ok(new Date(input))
      : fail(message, input),
});

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

export const maybe = <T,>(schema: Schema<T>): Schema<T | null | undefined> => ({
  ...schema,
  parse: (input) => (isNil(input) ? Ok(input) : schema.parse(input)),
});

export const def = <T,>(schema: Schema<T>, fallback: T): Schema<T> => ({
  ...schema,
  parse: (input) => (isNil(input) ? Ok(fallback) : schema.parse(input)),
});

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

export const tuple = <A extends Schema<unknown>, B extends Schema<unknown>[]>(
  schemas: [A, ...B],
  message = `Expecting array`,
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

export const unsafeParse = <T,>(schema: Schema<T>, input: unknown): T => {
  const result = schema.parse(input);
  if (!result.ok) {
    throw new Error(result.error.message);
  }
  return result.value;
};

const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export const email = <T extends string>(
  schema: Schema<T>,
  message = `Expected valid email address`,
) => refine(schema, (s) => EMAIL_REGEX.test(s), message);

export const int = <T extends number>(
  schema: Schema<T>,
  message = "Expecting number to be an integer",
) => refine(schema, (x) => Number.isInteger(x), message);

export const positive = <T extends number>(
  schema: Schema<T>,
  message = "Expected number to be positive",
) => refine(schema, (x) => x > 0, message);

export const negative = <T extends number>(
  schema: Schema<T>,
  message = "Expected number to be negative",
) => refine(schema, (x) => x < 0, message);

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

export function min(
  schema: Schema<number>,
  value: number,
  message?: string,
): Schema<number>;
export function min(
  schema: Schema<string>,
  value: number,
  message?: string,
): Schema<string>;
export function min(
  schema: Schema<Date>,
  value: Date,
  message?: string,
): Schema<Date>;
export function min(
  // deno-lint-ignore no-explicit-any
  schema: Schema<any>,
  value: number | Date,
  message = `Expected value to be greater than ${value}`,
) {
  return refine(
    schema,
    (x) => toComparableInt(x) >= toComparableInt(value),
    message,
  );
}

export function max(
  schema: Schema<number>,
  value: number,
  message?: string,
): Schema<number>;
export function max(
  schema: Schema<string>,
  value: number,
  message?: string,
): Schema<string>;
export function max(
  schema: Schema<Date>,
  value: Date,
  message?: string,
): Schema<Date>;
export function max(
  // deno-lint-ignore no-explicit-any
  schema: Schema<any>,
  value: number | Date,
  message = `Expected value to be lower than ${value}`,
) {
  return refine(
    schema,
    (x) => toComparableInt(x) <= toComparableInt(value),
    message,
  );
}
