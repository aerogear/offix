import { assert, expect } from "chai";
import { init } from "../src/index";

describe("Test app", () => {
  it("test api", () => {
    assert(init);
  });
});
