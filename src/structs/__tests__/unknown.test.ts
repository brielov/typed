import { unknown } from "../unknown";

const cases = [null, undefined, "", 0, false, true, {}, [], new Date()];

describe.each(cases)(".unknown()", (value) => {
  it("always returns ok", () => expect(unknown(value)).toBeOk(value));
});
