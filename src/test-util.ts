import { expect } from "vitest";

import { StructError, StructErrorInfo } from "./error";
import { isErr, isOk } from "./util";

export function expectOk(actual: any, expected: any) {
  if (isErr(actual)) {
    throw new Error(`Expected ok, got err: ${actual.error.message}`);
  }
  expect(actual.value).toEqual(expected);
}

export function expectErr(
  actual: any,
  message: string,
  info?: StructErrorInfo,
) {
  if (isOk(actual)) {
    throw new Error(`Expected err, got ok`);
  }
  expect(actual.error).toBeInstanceOf(StructError);
  expect(actual.error.message).toEqual(message);
  if (info) {
    expect(actual.error.info).toEqual(expect.objectContaining(info));
  }
}
