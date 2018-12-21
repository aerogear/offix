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

  protected builder: MetricsBuilder;
  protected publisher?: MetricsPublisher;
  protected configuration?: ServiceConfiguration;
  private readonly defaultMetrics?: Metrics[];

  // constructor params are there to provide a mechanism to override the metricsBuilder and metricsPublisher before
  // the initial sendAppAndDeviceMetrics() execution happens. this is necessary in tests
  constructor(options?: {configuration?: any, builder?: MetricsBuilder, publisher?: MetricsPublisher}) {
    const configuration = options && options.configuration
      ? options.configuration
      : INSTANCE.getConfigByType(MetricsService.TYPE);

    if (configuration && configuration.length > 0) {
      this.configuration = configuration[0];
    }

    this.builder = options && options.builder
      ? options.builder
      : new MetricsBuilder();

    if (this.configuration) {
      this.defaultMetrics = this.builder.buildDefaultMetrics();

      this.publisher = options && options.publisher
        ? options.publisher
        : new NetworkMetricsPublisher(this.configuration.url);

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

  get metricsBuilder(): MetricsBuilder {
    return this.builder;
  }

  set metricsBuilder(builder: MetricsBuilder) {
    this.builder = builder;
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
      clientId: this.builder.getClientId(),
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
