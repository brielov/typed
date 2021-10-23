declare type Err = {
    path: string[];
    message: string;
};
declare type Success<T> = {
    success: true;
    data: T;
};
declare type Failure = {
    success: false;
    errors: Err[];
};
declare type Result<T> = Success<T> | Failure;
declare type Type<T = unknown> = (x: unknown) => Result<T>;
declare type Shape = {
    [key: string]: Type;
};
declare type Infer<T> = T extends Shape ? {
    [K in keyof T]: Infer<T[K]>;
} : T extends Type<infer U> ? U : never;
declare type Literal = string | number | boolean | null;
declare type Enum = {
    [key: string]: string | number;
};
/**
 * Borrowed from `superstruct`
 * @see https://github.com/ianstormtaylor/superstruct/blob/28e0b32d5506a7c73e63f7e718b23977e58aac18/src/utils.ts#L393
 */
declare type InferTuple<Tuple extends Type[], Length extends number = Tuple["length"]> = Length extends Length ? number extends Length ? Tuple : _InferTuple<Tuple, Length, []> : never;
declare type _InferTuple<Tuple extends Type[], Length extends number, Accumulated extends unknown[], Index extends number = Accumulated["length"]> = Index extends Length ? Accumulated : _InferTuple<Tuple, Length, [...Accumulated, Infer<Tuple[Index]>]>;

declare const toError: (message: string, path?: string[]) => Err;
declare const success: <T>(data: T) => Success<T>;
declare const failure: (...errors: Err[]) => Failure;
/**
 * Create a new Type that maps an input type to an output type
 */
declare const map: <I, O>(type: Type<I>, onSuccess: (value: I) => Result<O>) => Type<O>;

/**
 * Check if value is a string
 */
declare const string: Type<string>;
/**
 * Check if value is a number
 */
declare const number: Type<number>;
/**
 * Check if value is a boolean
 */
declare const boolean: Type<boolean>;
/**
 * Check if value is a valid date
 */
declare const date: Type<Date>;
/**
 * Check if value is an array of type T
 */
declare const array: <T>(type: Type<T>) => Type<T[]>;
/**
 * Check if value is an object with the specified shape
 */
declare const object: <T extends Shape>(shape: T) => Type<Infer<T>>;
/**
 * Check if value is a literal
 */
declare const literal: <T extends Literal>(constant: T) => Type<T>;
/**
 * Check if value is of type T or null
 */
declare const nullable: <T>(type: Type<T>) => Type<T | null>;
/**
 * Check if value is of type T or undefined
 */
declare const optional: <T>(type: Type<T>) => Type<T | undefined>;
/**
 * Check if value is an enum. This function expects a real TypeScript enum type
 */
declare const enums: <T extends Enum>(e: T) => Type<T>;
/**
 * Check if value is a tuple
 */
declare const tuple: <A extends Type<unknown>, B extends Type<unknown>[]>(types_0: A, ...types_1: B) => Type<[Infer<A>, ...InferTuple<B, B["length"]>]>;
/**
 * Check if value is any of the specified types
 */
declare const union: <A extends Type<unknown>, B extends Type<unknown>[]>(types_0: A, ...types_1: B) => Type<Infer<A> | InferTuple<B, B["length"]>[number]>;
/**
 * A passthrough function which returns its input marked as any.
 * Do not use this unless you really need to, it defeats the purpose of this library.
 */
declare const any: Type<any>;
/**
 * Coerce first, then check if value is a string
 */
declare const asString: Type<string>;
/**
 * Coerce first, then check if value is a number
 */
declare const asNumber: Type<number>;
/**
 * Coerce first, then check if value is a valid date
 */
declare const asDate: Type<Date>;

export { Err, Failure, Infer, Result, Success, Type, any, array, asDate, asNumber, asString, boolean, date, enums, failure, literal, map, nullable, number, object, optional, string, success, toError, tuple, union };
