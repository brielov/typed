import { Result } from "../result";

export type Struct<O = unknown, I = unknown> = (
  input: I,
) => Result<O, StructError>;

export type StructError = {
  path: string[];
  message: string;
  actual: unknown;
  expected: unknown;
};

export type Infer<T> = T extends Struct<infer U> ? U : never;

export type InferShape<T extends { [key: string]: Struct }> = {
  [K in keyof T]: Infer<T[K]>;
};

export type Literal = string | number | boolean | null;

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
