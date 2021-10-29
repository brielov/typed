import type {
  Enum,
  Err,
  ExpectType,
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
  mapErrorKey,
  success,
  toError,
  toMessage,
  toResult,
} from "./util";

/**
 * Check if value is of a given type.
 * @since 1.0.0
 */
const expectType =
  <T extends string>(expected: T): Typed<ExpectType<T>> =>
  (x) => {
    const actual = getTypeOf(x);
    return actual === expected
      ? success(x as any)
      : failure(toError(toMessage(expected, actual)));
  };

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
export const string = expectType("string");

/**
 * Check if value is a number
 * @since 1.0.0
 */
export const number = map(expectType("number"), (x) =>
  Number.isFinite(x)
    ? success(x)
    : failure(toError(`Expecting value to be a finite 'number'`)),
);

/**
 * Check if value is a boolean
 * @since 1.0.0
 */
export const boolean = expectType("boolean");

/**
 * Check if value is a valid date
 * @since 1.0.0
 */
export const date = map(expectType("date"), (x) =>
  Number.isFinite(x.getTime())
    ? success(x)
    : failure(toError(`Expecting value to be a valid 'date'`)),
);

/**
 * Check if value is an array of type T
 * @since 1.0.0
 */
export const array = <T>(type: Typed<T>) =>
  map(expectType("array"), (x) =>
    toResult(
      ...(x.reduce(
        ([acc, errors], value, index) => {
          const result = type(value);
          return result.success
            ? ([acc.concat(result.value), errors] as any)
            : [acc, errors.concat(mapErrorKey(result.errors, index))];
        },
        [[], []],
      ) as [T[], Err[]]),
    ),
  );

/**
 * Check if value is an object with the specified shape
 * @since 1.0.0
 */
export const object = <T extends Shape>(shape: T): Typed<Infer<T>> => {
  const entries = Object.entries(shape);
  return map(expectType("object"), (x) =>
    toResult(
      ...entries.reduce(
        ([data, errors], [prop, type]) => {
          const result = type(x[prop]);
          return result.success
            ? ([{ ...data, [prop]: result.value }, errors] as any)
            : [data, errors.concat(mapErrorKey(result.errors, prop))];
        },
        [{}, []] as [any, Err[]],
      ),
    ),
  );
};

/**
 * check if value is a literal
 * @since 1.0.0
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
export const enums = <T extends Enum>(e: T): Typed<T> => {
  const values = Object.values(e);
  return (x) => {
    return values.includes(x as any)
      ? success(x as T)
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
export const tuple = <A extends Typed, B extends Typed[]>(
  ...types: [A, ...B]
): Typed<[Infer<A>, ...InferTuple<B>]> =>
  map(
    expectType("array"),
    (x) =>
      toResult(
        ...(types.reduce(
          ([acc, errors], type, index) => {
            const result = type(x[index]);
            return result.success
              ? [acc.concat(result.value), errors]
              : [acc, errors.concat(mapErrorKey(result.errors, index))];
          },
          [[], []] as [any[], Err[]],
        ) as [any[], Err[]]),
      ) as any,
  );

/**
 * Check if value is any of the specified types
 * @since 1.0.0
 */
export const union =
  <A extends Typed, B extends Typed[]>(
    ...types: [A, ...B]
  ): Typed<Infer<A> | InferTuple<B>[number]> =>
  (x): Result<Infer<A> | InferTuple<B>[number]> => {
    let errors: Err[] = [];

    // Using a for loop here because we want to stop early if we find a match
    for (const type of types) {
      const result = type(x);
      if (result.success) {
        return result as any;
      }
      errors = errors.concat(result.errors);
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
