import { None, Option, Some } from "./option";
import { isFunction } from "./type-guards";
import { AnyFunc, Present } from "./types";
import { identity, raise } from "./util";

export class Result<T, E> {
  private constructor(
    private readonly _ok: boolean,
    private readonly value: T | E,
  ) {}

  static ok<T>(value: Present<T>): Result<T, never> {
    return new Result(true, value) as Result<T, never>;
  }

  static err<E>(value: Present<E>): Result<never, E> {
    return new Result(false, value) as Result<never, E>;
  }

  static from<T>(fn: () => Present<T>): Result<T, unknown> {
    try {
      return Result.ok(fn());
    } catch (err) {
      return Result.err(err);
    }
  }

  static fromAsync<T>(
    fn: () => Promise<Present<T>>,
  ): Promise<Result<T, unknown>>;
  static fromAsync<T>(
    promise: Promise<Present<T>>,
  ): Promise<Result<T, unknown>>;
  static async fromAsync(value: AnyFunc | Promise<unknown>) {
    try {
      const promise = isFunction(value) ? value() : value;
      return Result.ok(await promise);
    } catch (err) {
      return Result.err(err);
    }
  }

  public isOk(): boolean {
    return this._ok;
  }

  public isOkAnd(f: (value: T) => boolean): boolean {
    return this.match(f, () => false);
  }

  public isErr(): boolean {
    return !this.isOk();
  }

  public isErrAnd(f: (err: E) => boolean): boolean {
    return this.match(() => false, f);
  }

  public match<O>(ok: (value: T) => O, err: (value: E) => O): O {
    return this.isOk() ? ok(this.value as T) : err(this.value as E);
  }

  public ok(): Option<T> {
    return this.match(
      (value) => Some(value as Present<T>),
      () => None,
    );
  }

  public err(): Option<E> {
    return this.match(
      () => None,
      (err) => Some(err as Present<E>),
    );
  }

  public map<U>(op: (value: T) => Present<U>): Result<U, E> {
    return this.match(
      (value) => Result.ok(op(value)),
      () => this as unknown as Result<U, E>,
    );
  }

  public mapOr<U>(def: Present<U>, f: (value: T) => Present<U>): U {
    return this.match(f, () => def);
  }

  public mapOrElse<U>(
    def: (value: E) => Present<U>,
    f: (value: T) => Present<U>,
  ): U {
    return this.match(f, def);
  }

  public mapErr<F>(op: (value: E) => Present<F>): Result<T, F> {
    return this.match(
      () => this as unknown as Result<T, F>,
      (err) => Result.err(op(err)),
    );
  }

  public inspect(f: (value: T) => void): this {
    this.match(f, identity);
    return this;
  }

  public inspectErr(f: (value: E) => void): this {
    this.match(identity, f);
    return this;
  }

  public expect(msg: string): T {
    return this.match(identity, () => raise(msg));
  }

  public expectErr(msg: string): E {
    return this.match(() => raise(msg), identity);
  }

  public unwrap(): T {
    return this.match(identity, () =>
      raise("called Result.unwrap on an `Err` value"),
    );
  }

  public unwrapErr(): E {
    return this.match(
      () => raise("called Result.unwrapErr on an `Ok` value"),
      identity,
    );
  }

  public and<U>(res: Result<U, E>): Result<U, E> {
    return this.match(
      () => res,
      () => this as unknown as Result<U, E>,
    );
  }

  public andThen<U>(op: (value: T) => Result<Present<U>, E>): Result<U, E> {
    return this.match(op, () => this as unknown as Result<U, E>);
  }

  public or<F>(res: Result<T, Present<F>>): Result<T, F> {
    return this.match(
      () => this as unknown as Result<T, F>,
      () => res,
    );
  }

  public orElse<F>(op: (value: E) => Result<T, Present<F>>): Result<T, F> {
    return this.match(() => this as unknown as Result<T, F>, op);
  }

  public unwrapOr(def: T): T {
    return this.match(identity, () => def);
  }

  public unwrapOrElse(op: (value: E) => T): T {
    return this.match(identity, op);
  }
}

export const Ok = Result.ok;
export const Err = Result.err;

export function isResult(value: unknown): value is Result<unknown, unknown> {
  return value instanceof Result;
}
