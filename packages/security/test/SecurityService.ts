import { assert, expect } from "chai";
import mocha from "mocha";

import { SecurityService } from "../src";
import { MockCheck } from "./mocks/MockCheck";

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

  describe("#checkMany", () => {
    it("should allow for no arguments", async () => {
      const results = await securityService.checkMany();
      expect(results.length).to.equal(0);
    });

    it("should run multiple checks", async () => {
      const results = await securityService.checkMany(new MockCheck(true), new MockCheck(false));
      expect(results.length).to.equal(2);
      assert(results[0].passed);
      assert.isFalse(results[1].passed);
    });
  });
});
