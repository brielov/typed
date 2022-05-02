export * from "./structs/index.ts";
export type { Ok, Err, Result, Struct, Infer } from "./types.ts";
export { StructError } from "./error.ts";
export { chain, err, isErr, isOk, map, ok, unwrap, unwrapOr } from "./util.ts";
