import type { StructError } from "./error";

export interface Ok<T> {
  readonly ok: true;
  readonly value: T;
}

export interface Err<E extends Error> {
  readonly ok: false;
  readonly error: E;
}

export type Result<T, E extends Error = Error> = Ok<T> | Err<E>;

export type Struct<O = any, I = any> = (input: I) => Result<O, StructError>;

export type Shape = { [key: string]: Struct };
export type Obj = { [key: string]: any };
export type Literal = string | number | boolean | null;
export type Enum = { [key: string]: string | number };

export type Infer<T> = T extends Shape
  ? { [K in keyof T]: Infer<T[K]> }
  : T extends Struct<infer U>
  ? U
  : never;

/**
 * Borrowed from `superstruct`
 * @see https://github.com/ianstormtaylor/superstruct/blob/28e0b32d5506a7c73e63f7e718b23977e58aac18/src/utils.ts#L393
 */
export type InferTuple<
  Tuple extends Struct[],
  Length extends number = Tuple["length"],
> = Length extends Length
  ? number extends Length
    ? Tuple
    : _InferTuple<Tuple, Length, []>
  : never;

export type _InferTuple<
  Tuple extends Struct[],
  Length extends number,
  Accumulated extends any[],
  Index extends number = Accumulated["length"],
> = Index extends Length
  ? Accumulated
  : _InferTuple<Tuple, Length, [...Accumulated, Infer<Tuple[Index]>]>;

/**
 * Borrowed from `superstruct`
 * @see https://github.com/ianstormtaylor/superstruct/blob/28e0b32d5506a7c73e63f7e718b23977e58aac18/src/utils.ts#L200
 */
export type UnionToIntersection<U> = (
  U extends any ? (arg: U) => any : never
) extends (arg: infer I) => void
  ? I
  : never;
