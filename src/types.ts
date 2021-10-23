export type Err = { path: string[]; message: string };
export type Success<T> = { success: true; data: T };
export type Failure = { success: false; errors: Err[] };
export type Result<T> = Success<T> | Failure;

export type Type<T = unknown> = (x: unknown) => Result<T>;
export type Shape = { [key: string]: Type };

export type Infer<T> = T extends Shape
  ? { [K in keyof T]: Infer<T[K]> }
  : T extends Type<infer U>
  ? U
  : never;

export type Literal = string | number | boolean | null;
export type Enum = { [key: string]: string | number };

/**
 * Borrowed from `superstruct`
 * @see https://github.com/ianstormtaylor/superstruct/blob/28e0b32d5506a7c73e63f7e718b23977e58aac18/src/utils.ts#L393
 */
export type InferTuple<
  Tuple extends Type[],
  Length extends number = Tuple["length"],
> = Length extends Length
  ? number extends Length
    ? Tuple
    : _InferTuple<Tuple, Length, []>
  : never;

type _InferTuple<
  Tuple extends Type[],
  Length extends number,
  Accumulated extends unknown[],
  Index extends number = Accumulated["length"],
> = Index extends Length
  ? Accumulated
  : _InferTuple<Tuple, Length, [...Accumulated, Infer<Tuple[Index]>]>;
