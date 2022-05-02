import { Enum, Struct } from "../types.ts";
import { StructError } from "../error.ts";
import { err, ok } from "../util.ts";

/**
 * Creates a new struct that accepts a enum.
 */
export const enums = <T extends Enum>(
  e: T,
  msg?: string,
): Struct<T[keyof T]> => {
  const values = Object.values(e);
  msg ??= `Expecting one of ${values.join(", ")}`;
  return (input) =>
    values.includes(input)
      ? ok(input)
      : err(new StructError(msg as string, { input, path: [] }));
};
