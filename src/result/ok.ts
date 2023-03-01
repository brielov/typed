import { None, Some } from "../option";
import { raise } from "../util";
import type { Result } from "./types";

export function Ok<T>(value: T): Result<T, never> {
  return {
    and: (res) => res,
    andThen: (op) => op(value),
    err: () => None,
    expect: () => value,
    expectErr: (msg) => raise(msg),
    inspect: (f) => {
      f(value);
      return Ok(value);
    },
    inspectErr: () => Ok(value),
    isErr: () => false,
    isErrAnd: () => false,
    isOk: () => true,
    isOkAnd: (f) => f(value),
    map: (op) => Ok(op(value)),
    mapErr: () => Ok(value),
    mapOr: (_, f) => f(value),
    mapOrElse: (_, f) => f(value),
    match: (ok) => ok(value),
    ok: () => Some(value),
    or: () => Ok(value),
    orElse: () => Ok(value),
    unwrap: () => value,
    unwrapErr: () => raise("called Result.unwrapErr on an `Ok` value"),
    unwrapOr: () => value,
    unwrapOrElse: () => value,
  };
}
