import { expect } from "vitest";

import { StructError, StructErrorInfo } from "./error";

export function expectOk(actual: any, expected: any) {
  expect(actual).toEqual({ ok: true, value: expected });
}

export function expectErr(
  actual: any,
  message: string,
  info?: StructErrorInfo,
) {
  expect(actual.ok).toBe(false);
  expect(actual.error).toBeInstanceOf(StructError);
  expect(actual.error.message).toEqual(message);
  if (info) {
    expect(actual.error.info).toEqual(expect.objectContaining(info));
  }
}
