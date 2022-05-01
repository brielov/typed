import { Struct } from "../types";
import { ok } from "../util";

/**
 * A passthrough struct that accepts any value but marks it as `unknown`.
 */
export const unknown: Struct<unknown> = (input) => ok(input);
