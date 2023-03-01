import { None, Some } from "../option";
import { raise } from "../util";
import type { Result } from "./types";

export function Err<E>(value: E): Result<never, E> {
  return {
    and: () => Err(value),
    andThen: () => Err(value),
    err: () => Some(value),
    expect: (msg) => raise(msg),
    expectErr: () => value,
    inspect: () => Err(value),
    inspectErr: (f) => {
      f(value);
      return Err(value);
    },
    isErr: () => true,
    isErrAnd: (f) => f(value),
    isOk: () => false,
    isOkAnd: () => false,
    map: () => Err(value),
    mapErr: (op) => Err(op(value)),
    mapOr: (def) => def,
    mapOrElse: (def) => def(value),
    match: (_, err) => err(value),
    ok: () => None,
    or: (res) => res,
    orElse: (op) => op(value),
    unwrap: () => raise("called Result.unwrap on an `Err` value"),
    unwrapErr: () => value,
    unwrapOr: (def) => def,
    unwrapOrElse: (op) => op(value),
  };
}
