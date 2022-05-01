import { expectOk } from "../../test-util";
import { unknown } from "../unknown";

const cases = [null, undefined, "", 0, false, true, {}, [], new Date()];

describe.each(cases)(".unknown()", (value) => {
  it("always returns ok", () => expectOk(unknown(value), value));
});
