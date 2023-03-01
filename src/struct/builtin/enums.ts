import { Err, Ok } from "../../result";
import { Struct } from "../types";
import { createError } from "../util";

export const enums = <T extends { [key: string]: number | string }>(
  en: T,
): Struct<T[keyof T]> => {
  const values = Object.values(en);
  return (input) =>
    values.includes(input as string)
      ? Ok(input as T[keyof T])
      : Err(createError());
};
