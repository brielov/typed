import { Struct } from "../types.ts";
import { ok } from "../util.ts";

/**
 * A passthrough struct that accepts any value but marks it as `unknown`.
 */
export const unknown: Struct<unknown> = (input) => ok(input);
