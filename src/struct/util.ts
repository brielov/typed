import { StructError } from "./types";

export function createError(): StructError {
  return {
    path: [],
    message: "",
    actual: "",
    expected: "",
  };
}
