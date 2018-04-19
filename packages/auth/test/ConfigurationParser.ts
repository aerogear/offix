import { assert, expect } from "chai";
import mocha from "mocha";

describe("Test", () => {

  beforeEach(() => {
    console.info("Test");
  });

  describe("#constructor", () => {

    it("should create config", () => {
      assert.ok("Ok", "Passed");
    });
 });
});
