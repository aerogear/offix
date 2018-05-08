import { assert, expect } from "chai";
import mocha from "mocha";

import { SecurityService } from "../src";
import { MockCheck } from "./MockCheck";

let securityService: SecurityService;

describe("SecurityService", () => {

  beforeEach(() => {
    securityService = new SecurityService();
  });

  describe("#test", () => {

    it("should pass", (done) => {
      securityService.check(new MockCheck(true))
      .then((result) => {
        assert(result.passed);
        expect(result.name).to.equal(MockCheck.name);
        done();
      }).catch((err) => done(err));
    });

    it("should fail", (done) => {
      securityService.check(new MockCheck(false))
      .then((result) => {
        assert.isFalse(result.passed);
        done();
      }).catch((err) => done(err));
    });
 });
});
