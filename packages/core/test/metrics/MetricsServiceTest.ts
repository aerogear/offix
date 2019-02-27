import { assert, expect } from "chai";
import sinon from "sinon";
import { Metrics, MetricsPayload, MetricsPublisher, MetricsService, NetworkMetricsPublisher } from "../../src/metrics";
import testAerogearConfig from "../mobile-config.json";
import { MetricsBuilder } from "../../src/metrics/MetricsBuilder";

declare var global: any;
declare var window: any;

global.window = {};

window.device = {};
window.cordova = {

  getAppVersion: {
    getPackageName: () => {
      console.info("");
    },
    getVersionNumber: () => {
      console.info("");
    }
  }
};

describe("MetricsService", () => {
  const metricsConfig = testAerogearConfig.services
    .filter(service => service.type && service.type.toLowerCase() === "metrics");

  let metricsService: MetricsService;
  let metricsBuilder: MetricsBuilder;

  beforeEach(() => {
    metricsBuilder = new MockMetricsBuilder();
    metricsService = new DummyMetricsService({ configuration: [metricsConfig], builder: metricsBuilder });
  });

  describe("#constructor", () => {

    it("should instantiate NetworkMetricsPublisher with configuration url", () => {
      const publisher = metricsService.metricsPublisher as NetworkMetricsPublisher;

      assert.equal((metricsConfig as any).url, publisher.url);
    });

    it("should not throw an error when not being able to publish default metrics", () => {
      const test = () => new MetricsService({ configuration: testAerogearConfig, builder: metricsBuilder });

      expect(test).to.not.throw();
    });

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
        clientId: metricsBuilder.getClientId(),
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
        clientId: metricsBuilder.getClientId(),
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
      const test = () => metricsService.publish(null as unknown as string, []);

      expect(test).to.throw("Type is invalid: null");
    });

    it("should throw an error if type is undefined", () => {
      const test = () => metricsService.publish(undefined as unknown as string, []);

      expect(test).to.throw("Type is invalid: undefined");
    });

    it("should not throw an error if publisher is undefined", () => {
      metricsService.metricsPublisher = undefined;
      const test = () => metricsService.publish("type", []);

      expect(test).to.not.throw();
    });

  });

  /**
   * Mocked MetricsService that doesn't publish
   */
  class DummyMetricsService extends MetricsService {

    protected sendInitialAppAndDeviceMetrics() {
      return Promise.resolve();
    }

  }

  class MockMetricsPublisher implements MetricsPublisher {

    public publish(metrics: MetricsPayload): Promise<any> {
      return Promise.resolve({ statusCode: 204 });
    }
  }

  class MockMetricsBuilder extends MetricsBuilder {

    public getSavedClientId(): string {
      return "THE_CLIENT_ID";
    }

    public buildDefaultMetrics(): Metrics[] {
      return [
        { identifier: "default", collect: () => Promise.resolve("default") }
      ];
    }
  }

});
