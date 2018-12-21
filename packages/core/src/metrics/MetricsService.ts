import console from "loglevel";
import { ServiceConfiguration } from "../config";
import { INSTANCE } from "../Core";

import { isNative } from "../PlatformUtils";
import { Metrics, MetricsPayload } from "./model";
import { MetricsPublisher, NetworkMetricsPublisher } from "./publisher";
import { MetricsBuilder } from "./MetricsBuilder";

declare var window: any;

/**
 * AeroGear Metrics SDK
 * Provides internal api for metrics that are sent to metrics server.
 */
export class MetricsService {

  public static readonly CLIENT_ID_KEY = "aerogear_metrics_client_key";
  public static readonly DEFAULT_METRICS_TYPE = "init";
  public static readonly TYPE = "metrics";

  protected metricsBuilder: MetricsBuilder;
  protected publisher?: MetricsPublisher;
  protected configuration?: ServiceConfiguration;
  private readonly defaultMetrics?: Metrics[];

  constructor() {
    const configuration = INSTANCE.getConfigByType(MetricsService.TYPE);
    this.metricsBuilder = new MetricsBuilder();
    if (configuration && configuration.length > 0) {
      this.defaultMetrics = this.metricsBuilder.buildDefaultMetrics();
      this.configuration = configuration[0];
      this.publisher = new NetworkMetricsPublisher(this.configuration.url);
      this.sendAppAndDeviceMetrics();
    } else {
      console.warn("Metrics configuration is missing." +
        "Metrics will not be published to remote server.");
    }
  }

  set metricsPublisher(publisher: MetricsPublisher | undefined) {
    this.publisher = publisher;
  }

  get metricsPublisher(): MetricsPublisher | undefined {
    return this.publisher;
  }

  /**
   * Publish metrics using predefined publisher
   *
   * @param type type of the metrics to be published
   * @param metrics metrics instances that should be published
   */
  public publish(type: string, metrics: Metrics[]): Promise<any> {
    if (!type) {
      throw new Error(`Type is invalid: ${type}`);
    }

    const { publisher } = this;

    if (!publisher || !this.defaultMetrics) {
      const err = new Error("Metrics server configuration is missing. Metrics will be disabled.");
      console.warn(err);
      return Promise.reject(err);
    }

    if (!isNative()) {
      const err = new Error("Metrics implementation is disabled for browser platform.");
      console.warn(err);
      return Promise.reject(err);
    }

    const payload: MetricsPayload = {
      clientId: this.metricsBuilder.getClientId(),
      type,
      timestamp: new Date().getTime(),
      data: {}
    };

    const metricsPromise = metrics.concat(this.defaultMetrics)
      .map(m => m.collect().then(data => {
        payload.data[m.identifier] = data;
      }));

    return Promise.all(metricsPromise).then(() => {
      return publisher.publish(payload);
    });
  }

  /**
   * Collect metrics for all active metrics collectors
   * Send data using metrics publisher
   */
  protected sendAppAndDeviceMetrics(): Promise<any> {
    return this.publish(MetricsService.DEFAULT_METRICS_TYPE, []).catch((error) => {
      console.error("Error when sending metrics", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    });
  }

}
