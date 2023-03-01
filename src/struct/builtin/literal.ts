import { Err, Ok } from "../../result";
import { Literal, Struct } from "../types";
import { createError } from "../util";

export const literal =
  <T extends Literal>(constant: T): Struct<T> =>
  (input) =>
    input === constant ? Ok(input as T) : Err(createError());
