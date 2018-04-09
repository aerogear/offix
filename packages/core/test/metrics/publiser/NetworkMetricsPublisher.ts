import { assert } from "chai";
import mocha from "mocha";
import * as mockttp from "mockttp";
import uuid from "uuid/v1";
import { ConfigurationParser, ServiceConfiguration } from "../../../src/configuration";
import {
  Metrics,
  MetricsPayload,
  MetricsPublisher,
  MetricsService,
  NetworkMetricsPublisher
} from "../../../src/metrics";
import testAerogearConfig from "../../mobile-config.json";

describe("NetworkMetricsPublisher", () => {

  const validMetrics = {
    clientId: "123",
    data: {}
  };

  const mockServer = mockttp.getLocal();
  let publisher;

  before(async () => {
    await mockServer.start();
    await mockServer.post("/").thenReply(204);

    publisher = new NetworkMetricsPublisher(mockServer.url);
  });

  after(() => {
    mockServer.stop();
  });

  describe("#publish", () => {

    it("should return 204 is metrics are published", async () => {
      const res = await publisher.publish(validMetrics);

      assert.equal(res.status, 204);
    });

  });

});
