import { MetricsService } from "@aerogear/core";

export class MockMetricsService extends MetricsService {
  private clientId: string;

  protected getSavedClientId(): string {
    return this.clientId;
  }

  protected saveClientId(id: string): void {
    this.clientId = id;
  }

  protected buildDefaultMetrics(): Metrics[] {
    return [
      { identifier: "default", collect: () => Promise.resolve("default") }
    ];
  }

  protected sendInitialAppAndDeviceMetrics() {
    return Promise.resolve();
  }
}
