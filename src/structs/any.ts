import { Struct } from "../types";
import { ok } from "../util";

/**
 * A passthrough struct that accepts any value but marks it as `any`.
 */
export const any: Struct<any> = (input) => ok(input);
