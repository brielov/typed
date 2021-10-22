export type Err = { path: string[]; message: string };
export type Success<T> = { success: true; data: T };
export type Failure = { success: false; errors: Err[] };
export type Result<T> = Success<T> | Failure;

export type Guard<T = unknown> = (x: unknown) => Result<T>;
export type Shape = { [key: string]: Guard };

export type Infer<T> = T extends Shape
  ? { [K in keyof T]: Infer<T[K]> }
  : T extends Guard<infer U>
  ? U
  : never;

export type Literal = string | number | boolean | null;
export type Enum = { [key: string]: string | number };

export type InferTuple<
  Tuple extends Guard[],
  Length extends number = Tuple["length"],
> = Length extends Length
  ? number extends Length
    ? Tuple
    : _InferTuple<Tuple, Length, []>
  : never;

type _InferTuple<
  Tuple extends Guard[],
  Length extends number,
  Accumulated extends unknown[],
  Index extends number = Accumulated["length"],
> = Index extends Length
  ? Accumulated
  : _InferTuple<Tuple, Length, [...Accumulated, Infer<Tuple[Index]>]>;
