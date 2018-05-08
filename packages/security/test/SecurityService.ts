import { assert, expect } from "chai";
import mocha from "mocha";

import { SecurityService } from "../src";
import { MockCheck } from "./MockCheck";

let securityService: SecurityService;

describe("SecurityService", () => {

  beforeEach(() => {
    securityService = new SecurityService();
  });

  describe("#check", () => {

    it("should pass if the provided check passes", async () => {
      const mockCheck = new MockCheck(true);
      const result = await securityService.check(mockCheck);
      assert(result.passed);
      expect(result.name).to.equal(mockCheck.name);
    });

    it("should fail if the provided check fails", async () => {
      const result = await securityService.check(new MockCheck(false));
      assert.isFalse(result.passed);
    });
 });
});
