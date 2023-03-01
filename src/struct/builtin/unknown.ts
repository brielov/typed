import { Ok } from "../../result";
import { Struct } from "../types";

export const unknown: Struct<unknown> = (input) => Ok(input);
