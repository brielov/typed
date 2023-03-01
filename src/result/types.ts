import { Option } from "../option";

export interface Result<T, E> {
  and<U>(res: Result<U, E>): Result<U, E>;
  andThen<U>(op: (value: T) => Result<U, E>): Result<U, E>;
  err(): Option<E>;
  expect(msg: string): T;
  expectErr(msg: string): E;
  inspect(f: (value: T) => void): this;
  inspectErr(f: (value: E) => void): this;
  isErr(): boolean;
  isErrAnd(f: (value: E) => boolean): boolean;
  isOk(): boolean;
  isOkAnd(f: (value: T) => boolean): boolean;
  map<U>(op: (value: T) => U): Result<U, E>;
  mapErr<F>(op: (value: E) => F): Result<T, F>;
  mapOr<U>(def: U, f: (value: T) => U): U;
  mapOrElse<U>(def: (value: E) => U, f: (value: T) => U): U;
  match<O>(ok: (value: T) => O, err: (value: E) => O): O;
  ok(): Option<T>;
  or<F>(res: Result<T, F>): Result<T, F>;
  orElse<F>(op: (value: E) => Result<T, F>): Result<T, F>;
  unwrap(): T;
  unwrapErr(): E;
  unwrapOr(def: T): T;
  unwrapOrElse(op: (value: E) => T): T;
}
