import { assert, expect } from "chai";
import mocha from "mocha";
import sinon from "sinon";
import uuid from "uuid/v1";
import { ConfigurationHelper, ServiceConfiguration } from "../../src/configuration";
import {
  Metrics,
  MetricsPayload,
  MetricsPublisher,
  MetricsService,
  NetworkMetricsPublisher
} from "../../src/metrics";
import testAerogearConfig from "../mobile-config.json";

describe("MetricsService", () => {

  const metricsConfig = new ConfigurationHelper(testAerogearConfig).getConfig(MetricsService.ID);
  const storage = { clientId: null };

  let metricsService: MetricsService;

  beforeEach(() => {
    metricsService = new DummyMetricsService(testAerogearConfig);
    storage.clientId = null;
  });

  describe("#constructor", () => {

    it("should instantiate NetworkMetricsPublisher with configuration url", () => {
      const { url } = metricsConfig;
      const publisher = metricsService.metricsPublisher as NetworkMetricsPublisher;

      assert.equal(url, publisher.url);
    });

    it("should publish default metrics");

    it("should not throw an error when not being able to publish default metrics", () => {
      const test = () => new MockMetricsService(testAerogearConfig);

      expect(test).to.not.throw();
    });

    it("should create Android and iOS default metrics when in a Cordova app");

  });

  describe("#setPublisher", () => {

    it("should be possible to override the publisher", async () => {
      const customPublisher = new MockMetricsPublisher();
      const spy = sinon.spy(customPublisher, "publish");
      metricsService.metricsPublisher = customPublisher;

      const res = await metricsService.publish("init", []);

      sinon.assert.calledOnce(spy);
    });

  });

  describe("#sendAppAndDeviceMetrics", () => {

    it("should publish default metrics", async () => {
      const mockPublisher = new MockMetricsPublisher();
      const spy = sinon.spy(mockPublisher, "publish");
      metricsService.metricsPublisher = mockPublisher;

      const type = DummyMetricsService.DEFAULT_METRICS_TYPE;

      const defaultMatcher: MetricsPayload = {
        clientId: metricsService.getClientId(),
        type,
        data: {
          default: "default"
        }
      };

      await metricsService.sendAppAndDeviceMetrics();

      sinon.assert.calledWithMatch(spy, defaultMatcher);
    });

  });

  describe("#publish", () => {

    it("should publish a MetricsPayload from an array of Metrics", async () => {
      const mockPublisher = new MockMetricsPublisher();
      const spy = sinon.spy(mockPublisher, "publish");
      metricsService.metricsPublisher = mockPublisher;

      const someNumber = Promise.resolve(123);
      const someString = Promise.resolve("foo");

      const type = "init";
      const metrics: Metrics[] = [
        { identifier: "someNumber", collect: () => someNumber },
        { identifier: "someString", collect: () => someString }
      ];
      const matcher: MetricsPayload = {
        clientId: metricsService.getClientId(),
        type,
        data: {
          someNumber: 123,
          someString: "foo"
        }
      };

      await metricsService.publish(type, metrics);

      sinon.assert.calledWithMatch(spy, matcher);
    });

    it("should throw an error if type is null", () => {
      const test = () => metricsService.publish(null, []);

      expect(test).to.throw("Type is invalid: null");
    });

    it("should throw an error if type is undefined", () => {
      const test = () => metricsService.publish(undefined, []);

      expect(test).to.throw("Type is invalid: undefined");
    });

    it("should not throw an error if publisher is undefined", () => {
      metricsService.metricsPublisher = undefined;
      const test = () => metricsService.publish("type", []);

      expect(test).to.not.throw();
    });

  });

  describe("#getClientId", () => {

    it("should generate a string client id", () => {
      const id = metricsService.getClientId();

      assert.isString(id);
    });

    it("should save the client id when getting for first time", () => {
      assert.isNull(storage.clientId);
      const id = metricsService.getClientId();

      assert.equal(storage.clientId, id);
    });

    it("should generate a new unique clientID if none is saved", () => {
      const id = metricsService.getClientId();
      // Remove id from storage, as if it was a different device
      storage.clientId = null;
      const newId = metricsService.getClientId();

      assert.notEqual(id, newId);
    });

    it("should return the same clientID after the first time", () => {
      const id = metricsService.getClientId();
      const newId = metricsService.getClientId();

      assert.equal(id, newId);
    });

  });

  /**
   * Test MetricsService that mocks all browser or device functionality
   */
  class MockMetricsService extends MetricsService {

    protected getSavedClientId(): string {
      return storage.clientId;
    }

    protected saveClientId(id: string): void {
      storage.clientId = id;
    }

    protected buildDefaultMetrics(): Metrics[] {
      return [
        { identifier: "default", collect: () => Promise.resolve("default") }
      ];
    }
  }

  /**
   * Mocked MetricsService that doesn't publish
   */
  class DummyMetricsService extends MockMetricsService {

    protected sendInitialAppAndDeviceMetrics() {
      return Promise.resolve();
    }

  }

  class MockMetricsPublisher implements MetricsPublisher {

    public publish(metrics: MetricsPayload): Promise<any> {
      return Promise.resolve({ statusCode: 204 });
    }
  }

});
