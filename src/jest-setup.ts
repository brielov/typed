import { StructError, StructErrorInfo } from "./error";
import { isErr, isOk, ok } from "./util";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace jest {
    interface Matchers<R> {
      toBeOk(expected: any): R;
      toBeErr(message: string, info?: StructErrorInfo): R;
    }
  }
}
const isExpand = (expand?: boolean): boolean => expand !== false;

expect.extend({
  toBeOk(this: jest.MatcherContext, received: any, value: any) {
    const matcherName = "toBeOk";

    const {
      matcherHint,
      printExpected,
      stringify,
      printReceived,
      printDiffOrStringify,
    } = this.utils;

    const options = {
      isNot: this.isNot,
    };

    if (isOk(received)) {
      const pass = this.equals(received.value, value);
      const expected = ok(value);

      return {
        message: () =>
          pass
            ? matcherHint(matcherName, undefined, undefined, options) +
              "\n\n" +
              `Expected: not ${printExpected(expected)}` +
              "\n" +
              (stringify(expected) !== stringify(received)
                ? `Received:     ${printReceived(received)}`
                : "")
            : matcherHint(matcherName, undefined, undefined, options) +
              "\n\n" +
              printDiffOrStringify(
                expected,
                received,
                "Expected",
                "Received",
                isExpand(this.expand),
              ),
        pass,
      };
    }
    return {
      pass: false,
      message: () => `Expected ${received} to be Ok`,
    };
  },

  toBeErr(
    this: jest.MatcherContext,
    received: any,
    message: string,
    info?: StructErrorInfo,
  ) {
    const matcherName = "toBeErr";

    const {
      matcherHint,
      printExpected,
      stringify,
      printReceived,
      printDiffOrStringify,
    } = this.utils;

    const options = {
      isNot: this.isNot,
    };

    if (isErr(received)) {
      if (!info) {
        const pass = this.equals(received.error.message, message);

        return {
          message: () =>
            pass
              ? matcherHint(matcherName, undefined, undefined, options) +
                "\n\n" +
                `Expected: not ${printExpected(message)}` +
                "\n" +
                (stringify(message) !== stringify(received.error.message)
                  ? `Received:     ${printReceived(received.error.message)}`
                  : "")
              : matcherHint(matcherName, undefined, undefined, options) +
                "\n\n" +
                printDiffOrStringify(
                  message,
                  received.error.message,
                  "Expected",
                  "Received",
                  isExpand(this.expand),
                ),
          pass,
        };
      }

      const receivedInfo = (received.error as StructError).info;

      const pass =
        this.equals(received.error.message, message) &&
        this.equals(receivedInfo, info);

      return {
        message: () =>
          pass
            ? matcherHint(matcherName, undefined, undefined, options) +
              "\n\n" +
              `Expected: not ${printExpected(info)}` +
              "\n" +
              (stringify(info) !== stringify(receivedInfo)
                ? `Received:     ${printReceived(receivedInfo)}`
                : "")
            : matcherHint(matcherName, undefined, undefined, options) +
              "\n\n" +
              printDiffOrStringify(
                info,
                receivedInfo,
                "Expected",
                "Received",
                isExpand(this.expand),
              ),
        pass,
      };
    }
    return {
      pass: false,
      message: () => `Expected ${received} to be Err`,
    };
  },
});
