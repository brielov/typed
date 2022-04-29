import { any } from "../any";

const cases = [null, undefined, "", 0, false, true, {}, [], new Date()];

describe.each(cases)(".any()", (value) => {
  it("always returns ok", () => {
    expect(any(value)).toBeOk(value);
  });
});
