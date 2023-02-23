export type Nil = null | undefined;

export type Maybe<T> = T | Nil;

export type Present<T> = T extends Nil ? never : T;

export type PlainObject = { [key: PropertyKey]: unknown };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyFunc = (...args: any[]) => any;

export type Primitive =
  | bigint
  | boolean
  | null
  | number
  | string
  | symbol
  | undefined;

export type Immutable<T> = T extends { [key: PropertyKey]: unknown }
  ? { readonly [K in keyof T]: Immutable<T[K]> }
  : T extends Array<infer U>
  ? ReadonlyArray<Immutable<U>>
  : Readonly<T>;
