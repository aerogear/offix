import console from "loglevel";
import uuid from "uuid/v1";
import { AeroGearConfiguration, ServiceConfiguration } from "../config";
import { INSTANCE } from "../Core";

import { isMobileCordova, isNative } from "../PlatformUtils";
import { Metrics, MetricsPayload } from "./model";
import { CordovaAppMetrics } from "./platform/CordovaAppMetrics";
import { CordovaDeviceMetrics } from "./platform/CordovaDeviceMetrics";
import { MetricsPublisher, NetworkMetricsPublisher } from "./publisher";
declare var window: any;

/**
 * AeroGear Metrics SDK
 * Provides internal api for metrics that are sent to metrics server.
 */
export class MetricsService {

  public static readonly CLIENT_ID_KEY = "aerogear_metrics_client_key";
  public static readonly DEFAULT_METRICS_TYPE = "init";
  public static readonly TYPE = "metrics";

  protected publisher?: MetricsPublisher;
  protected configuration?: ServiceConfiguration;
  private readonly defaultMetrics?: Metrics[];

  constructor() {
    const configuration = INSTANCE.getConfigByType(MetricsService.TYPE);
    if (configuration && configuration.length > 0) {
      this.defaultMetrics = this.buildDefaultMetrics();
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
      clientId: this.getClientId(),
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

  /**
   * Generates or gets mobile client id
   */
  protected getClientId(): string {
    let clientId = this.getSavedClientId();

    if (!clientId) {
      clientId = uuid();
      this.saveClientId(clientId);
    }

    return clientId;
  }

  protected getSavedClientId(): string | undefined {
    return window.localStorage.getItem(MetricsService.CLIENT_ID_KEY);
  }

  protected saveClientId(id: string): void {
    window.localStorage.setItem(MetricsService.CLIENT_ID_KEY, id);
  }

  /**
   * Builds array of default metrics objects that are sent to server on every request.
   * Other platforms can override this method to provide custom behavior
   */
  protected buildDefaultMetrics(): Metrics[] {
    if (isMobileCordova()) {
      return [new CordovaAppMetrics(), new CordovaDeviceMetrics()];
    } else {
      // No support of other platforms in default implementation.
      // Please extend MetricsService class.
      console.warn("Current platform is not supported by metrics.");
      return [];
    }
  }
}
