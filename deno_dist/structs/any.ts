import { Struct } from "../types.ts";
import { ok } from "../util.ts";

/**
 * A passthrough struct that accepts any value but marks it as `any`.
 */
export const any: Struct<any> = (input) => ok(input);
