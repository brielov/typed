import { Ok } from "../result";
import { NONE } from "./none";
import type { Option } from "./types";

export function Some<T>(value: T): Option<T> {
  return {
    and: (optb) => optb,
    andThen: (f) => f(value),
    expect: () => value,
    filter: (predicate) => (predicate(value) ? Some(value) : NONE),
    inspect: (f) => {
      f(value);
      return Some(value);
    },
    isNone: () => false,
    isSome: () => true,
    isSomeAnd: (f) => f(value),
    map: (f) => Some(f(value)),
    mapOr: (_, f) => f(value),
    mapOrElse: (_, f) => f(value),
    match: (f) => f(value),
    or: () => Some(value),
    orElse: () => Some(value),
    unwrap: () => value,
    unwrapOr: () => value,
    unwrapOrElse: () => value,
    okOr: () => Ok(value),
    okOrElse: () => Ok(value),
  };
}
