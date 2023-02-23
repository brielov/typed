/* eslint-disable @typescript-eslint/no-explicit-any */
import { Result } from "./result";
import { isPresent } from "./type-guards";
import type { Present } from "./types";
import { identity, raise } from "./util";

export class Option<T> {
  private constructor(private readonly value: T) {}

  public static from<T>(value: T): Option<Present<T>> {
    return new Option(value as Present<T>);
  }

  public static some<T>(value: Present<T>): Option<T> {
    return new Option(value);
  }

  public static none = Object.freeze(new Option(null)) as Option<never>;

  public isSome(): boolean {
    return isPresent(this.value);
  }

  public isSomeAnd(f: (value: T) => boolean): boolean {
    return this.match(f, () => false);
  }

  public isNone(): boolean {
    return !this.isSome();
  }

  public match<O>(some: (value: T) => O, none: () => O): O {
    if (this.isSome()) return some(this.value);
    return none();
  }

  public and<U>(optb: Option<Present<U>>): Option<Present<U>> {
    return this.match(
      () => optb,
      () => this as any,
    );
  }

  public andThen<U>(f: (value: T) => Option<Present<U>>): Option<U> {
    return this.match(f, () => this as any);
  }

  public expect(msg: string): T {
    return this.match(identity, () => raise(msg));
  }

  public filter(predicate: (value: T) => boolean): Option<T> {
    if (this.isSome() && predicate(this.value)) {
      return this;
    }
    return new Option(null) as unknown as Option<T>;
  }

  public inspect(f: (value: T) => void): this {
    if (this.isSome()) {
      f(this.value);
    }
    return this;
  }

  public map<U>(f: (value: T) => Present<U>): Option<U> {
    return this.match(
      (value) => new Option(f(value)),
      () => this as unknown as Option<U>,
    );
  }

  public mapOr<U>(def: Present<U>, f: (value: T) => Present<U>): U {
    return this.match(f, () => def);
  }

  public mapOrElse<U>(def: () => Present<U>, f: (value: T) => Present<U>): U {
    return this.match(f, def);
  }

  public okOr<E>(err: Present<E>): Result<T, E> {
    return this.match(
      (value) => Result.ok(value as Present<T>) as Result<T, E>,
      () => Result.err(err),
    );
  }

  public okOrElse<E>(err: () => Present<E>): Result<T, E> {
    return this.match(
      (value) => Result.ok(value as Present<T>) as Result<T, E>,
      () => Result.err(err()),
    );
  }

  public or(optb: Option<T>): Option<T> {
    return this.match(
      () => this,
      () => optb,
    );
  }

  public orElse(f: () => Option<T>): Option<T> {
    return this.match(() => this, f);
  }

  public unwrap(): T {
    return this.match(identity, () =>
      raise("called Option::unwrap on a `None` value"),
    );
  }

  public unwrapOr(def: T): T {
    return this.match(identity, () => def);
  }

  public unwrapOrElse(f: () => T): T {
    return this.match(identity, f);
  }
}

export function Some<T>(value: Present<T>): Option<T> {
  return Option.some(value);
}

export const None = Option.none;

export function isOption(value: unknown): value is Option<unknown> {
  return value instanceof Option;
}
