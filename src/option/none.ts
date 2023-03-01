import { Err } from "../result";
import { raise } from "../util";
import type { Option } from "./types";

export const NONE = None();

function None(): Option<never> {
  return {
    and: () => NONE,
    andThen: () => NONE,
    expect: (msg) => raise(msg),
    filter: () => NONE,
    inspect: () => NONE,
    isNone: () => true,
    isSome: () => false,
    isSomeAnd: () => false,
    map: () => NONE,
    mapOr: (def) => def,
    mapOrElse: (def) => def(),
    match: (_, f) => f(),
    or: (optb) => optb,
    orElse: (f) => f(),
    unwrap: () => raise("called Option.unwrap on a `None` value"),
    unwrapOr: (def) => def,
    unwrapOrElse: (f) => f(),
    okOr: (v) => Err(v),
    okOrElse: (f) => Err(f()),
  };
}
