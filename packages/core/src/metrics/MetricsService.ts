import uuid from "uuid/v1";
import { AeroGearConfiguration, ConfigurationHelper, ServiceConfiguration } from "../configuration";
import { Metrics, MetricsPayload } from "./model";
import { CordovaAppMetrics } from "./platform/CordovaAppMetrics";
import { CordovaDeviceMetrics } from "./platform/CordovaDeviceMetrics";
import { isMobileCordova } from "./platform/PlatformUtils";
import { MetricsPublisher, NetworkMetricsPublisher } from "./publisher";

declare var window: any;

/**
 * AeroGear Services Metrics SDK
 */
export class MetricsService {

  public static readonly CLIENT_ID_KEY = "aerogear_metrics_client_key";
  public static readonly DEFAULT_METRICS_TYPE = "init";
  public static readonly ID = "metrics";

  protected publisher?: MetricsPublisher;
  protected configuration?: ServiceConfiguration;
  private readonly defaultMetrics: Metrics[];

  constructor(appConfig: AeroGearConfiguration) {
    const configuration = new ConfigurationHelper(appConfig).getConfig(MetricsService.ID);
    this.defaultMetrics = this.buildDefaultMetrics();

    if (configuration) {
      this.configuration = configuration;
      this.publisher = new NetworkMetricsPublisher(configuration.url);
      this.sendInitialAppAndDeviceMetrics();
    } else {
      console.warn("Metrics configuration is missing. Metrics will not be published to remote server.");
    }
  }

  set metricsPublisher(publisher: MetricsPublisher | undefined) {
    this.publisher = publisher;
  }

  get metricsPublisher(): MetricsPublisher | undefined {
    return this.publisher;
  }

  /**
   * Collect metrics for all active metrics collectors
   * Send data using metrics publisher
   */
  public sendAppAndDeviceMetrics(): Promise<any> {
    return this.publish(MetricsService.DEFAULT_METRICS_TYPE, []);
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

    if (!publisher) {
      return Promise.resolve();
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
   * Generates or gets mobile client id
   */
  public getClientId(): string {
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
      return [];
    }
  }

  /**
   * Sends default metrics for first time
   */
  protected sendInitialAppAndDeviceMetrics(): void {
    this.sendAppAndDeviceMetrics()
      .catch((error) => {
        console.error("Error when sending metrics", JSON.stringify(error, Object.getOwnPropertyNames(error)));
      });
  }
}
