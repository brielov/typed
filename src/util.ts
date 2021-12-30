import { type Result } from "rsts";
import { type Type } from "./common";
import { TypeAggregateErr, TypeErr } from "./error";

/**
 * Check wether the value is a plain object
 */
export const isPlainObject = (
  value: unknown,
): value is { [key: string]: unknown } =>
  value !== null && typeof value === "object" && !Array.isArray(value);

/**
 * Create a commonly used message of mismatching types
 */
export const toMismatchMsg = (expected: string, actual: string) =>
  `Expecting type '${expected}'. Got type '${actual}'.`;

/**
 * Create a new error object.
 *
 * @param message - The error message.
 * @param path - The path to the error.
 * @returns The error object.
 * @since 1.0.0
 */
export const toErr = (message: string, path?: string[]) =>
  new TypeAggregateErr([new TypeErr(message, path)]);

/**
 * Prepend key to error list
 */
export const mapErrorKey = (
  key: string | number,
  ...errors: TypeErr[]
): TypeErr[] =>
  errors.map((err) => {
    err.path.unshift(String(key));
    return err;
  });

/**
 * Get the type of a value
 */
export const getTypeOf = (value: unknown) =>
  Object.prototype.toString.call(value).slice(8, -1).toLowerCase();

/**
 * Create a new type from a given base type.
 * It ensures that the base type passes validation before carrying on.
 *
 * @example
 * ```ts
 * const emailType = T.map(T.string, (value) =>
 *  EMAIL_REGEX.test(value)
 *    ? Ok(value)
 *    : Err(T.toError('Expecting string to be a valid email address'))
 * )
 * ```
 *
 * @param base - The base type.
 * @param onSuccess - The mapping function.
 * @returns The new type.
 * @since 1.0.0
 */
export const map =
  <I, O>(
    base: Type<I>,
    onSuccess: (value: I) => Result<O, TypeAggregateErr>,
  ): Type<O> =>
  (input) =>
    base(input).andThen(onSuccess);

/**
 * It allows you to further process the result of a type.
 * Specially usefull when trimming, upper casing, etc.
 * Keep in mind that the output type must be the same as the input type.
 *
 * @example
 * ```ts
 * const lowerTrim = T.refine(T.string, (value) => value.trim().toLowerCase())
 * lowerTrim('  HELLO WORLD  ') // Ok('hello world')
 * ```
 *
 * @param base - The base type.
 * @param onSuccess - The mapping function.
 * @returns The new type.
 * @since 1.3.0
 */
export const refine =
  <I>(base: Type<I>, onSuccess: (value: I) => I): Type<I> =>
  (input) =>
    base(input).map(onSuccess);
