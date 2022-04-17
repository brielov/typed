export * from "./structs";
export type { Ok, Err, Result, Struct, Infer } from "./types";
export { StructError } from "./error";
export { chain, err, isErr, isOk, map, ok, unwrap, unwrapOr } from "./util";
