import { assert, expect } from "chai";
import mocha from "mocha";

import { SecurityService } from "../src";
import mobileConfigJson from "./config/mobile-services.json";
import { MockCheck } from "./mocks/MockCheck";
import { MockMetricsPublisher } from "./mocks/MockMetricsPublisher";
import { MockMetricsService } from "./mocks/MockMetricsService";

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

  describe("#publishCheckResults", () => {
    it("should return null if no results are provided", async () => {
      const publishResult = await securityService.publishCheckResultMetrics();
      assert.isNull(publishResult);
    });

    it("should complete if custom metrics publisher is provided", async () => {
      const mockMetricsService = new MockMetricsService(mobileConfigJson);
      mockMetricsService.metricsPublisher = new MockMetricsPublisher();

      const results = await securityService.checkMany(new MockCheck(true), new MockCheck(false));
      const publishResult = await securityService.publishCheckResultMetrics(results, mockMetricsService);

      expect(publishResult.resultMetrics.length).to.equal(2);
      assert(publishResult.resultMetrics[0].passed);
      assert.isFalse(publishResult.resultMetrics[1].passed);
    });
  });
});
