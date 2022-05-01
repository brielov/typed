import { any } from "../any";
import { expectOk } from "../../test-util";

const cases = [null, undefined, "", 0, false, true, {}, [], new Date()];

describe.each(cases)(".any()", (value) => {
  it("always returns ok", () => expectOk(any(value), value));
});
