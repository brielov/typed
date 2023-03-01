import { Result } from "../result";

export interface Option<T> {
  and<U>(optb: Option<U>): Option<U>;
  andThen<U>(f: (value: T) => Option<U>): Option<U>;
  expect(msg: string): T;
  filter(predicate: (value: T) => boolean): Option<T>;
  inspect(f: (value: T) => void): Option<T>;
  isNone(): boolean;
  isSome(): boolean;
  isSomeAnd(f: (value: T) => boolean): boolean;
  map<U>(f: (value: T) => U): Option<U>;
  mapOr<U>(def: U, f: (value: T) => U): U;
  mapOrElse<U>(def: () => U, f: (value: T) => U): U;
  match<O>(some: (value: T) => O, none: () => O): O;
  okOr<E>(err: E): Result<T, E>;
  okOrElse<E>(err: () => E): Result<T, E>;
  or(optb: Option<T>): Option<T>;
  orElse(f: () => Option<T>): Option<T>;
  unwrap(): T;
  unwrapOr(def: T): T;
  unwrapOrElse(f: () => T): T;
}
