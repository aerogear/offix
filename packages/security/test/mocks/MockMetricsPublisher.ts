import { MetricsPublisher } from "@aerogear/core";

export class MockMetricsPublisher implements MetricsPublisher {

  public publish(metrics: MetricsPayload): Promise<any> {
    return Promise.resolve({ statusCode: 204 });
  }
}
