/* eslint-disable @typescript-eslint/no-explicit-any */
import { expect } from "vitest";
import { isOption } from "../src/option";
import { isResult } from "../src/result";
import { isNil, isPresent } from "../src/type-guards";

interface CustomMatchers<R = unknown> {
  toBeSome(expected?: unknown): R;
  toBeNone(): R;
  toBeOk(expected?: unknown): R;
  toBeErr(expected?: unknown): R;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vi {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface Assertion extends CustomMatchers {}
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface AsymmetricMatchersContaining extends CustomMatchers {}
  }
}

expect.extend({
  toBeSome(recieved, expected) {
    const pass =
      isOption(recieved) &&
      isPresent((recieved as any).value) &&
      isPresent(expected)
        ? this.equals((recieved as any).value, expected)
        : true;

    return {
      pass,
      message: () => `Recieved is${this.isNot ? " not" : ""} some option`,
    };
  },
  toBeNone(recieved) {
    const pass = isOption(recieved) && isNil((recieved as any).value);

    return {
      pass,
      message: () => `Recieved is${this.isNot ? " not" : ""} none option`,
    };
  },
  toBeOk(recieved, expected) {
    const matches = isPresent(expected)
      ? this.equals((recieved as any).value, expected)
      : true;

    const pass = isResult(recieved) && (recieved as any)._ok && matches;

    return {
      pass,
      message: () => `Recieved is${this.isNot ? " not" : ""} ok result`,
    };
  },
  toBeErr(recieved, expected) {
    const matches = isPresent(expected)
      ? this.equals((recieved as any).value, expected)
      : true;

    const pass = isResult(recieved) && !(recieved as any)._ok && matches;

    return {
      pass,
      message: () => `Recieved is${this.isNot ? " not" : ""} err result`,
    };
  },
});
