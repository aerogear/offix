import uuid from "uuid/v1";
import { ServiceConfiguration } from "../configuration";
import { Metrics, MetricsPayload, MetricsType } from "./model";
import { MetricsPublisher, NetworkMetricsPublisher } from "./publisher";

declare var localStorage: any;

/**
 * AeroGear Services metrics service
 */
export abstract class MetricsService {

    public static readonly CLIENT_ID_KEY = "aerogear_metrics_client_key";
    public static readonly DEFAULT_METRICS_TYPE = "init";

    private publisher: MetricsPublisher;

    private readonly defaultMetrics: Metrics[];

    constructor(private readonly configuration: ServiceConfiguration) {
        this.publisher = new NetworkMetricsPublisher(configuration.url);
        this.defaultMetrics = this.buildDefaultMetrics();
    }

    protected abstract buildDefaultMetrics(): Metrics[];

    set metricsPublisher(publisher: MetricsPublisher) {
        this.publisher = publisher;
    }

    get metricsPublisher(): MetricsPublisher {
        return this.publisher;
    }

    /**
     * Collect metrics for all active metrics collectors
     * Send data using metrics publisher
     */
    public sendAppAndDeviceMetrics(): Promise<any> {
        return this.publish(MetricsService.DEFAULT_METRICS_TYPE, this.defaultMetrics);
    }

    /**
     * Publish metrics using predefined publisher
     *
     * @param type type of the metrics to be published
     * @param metrics metrics instances that should be published
     */
    public publish(type: MetricsType, metrics: Metrics[]): Promise<any> {
        if (!type) {
            throw new Error(`Type is invalid: ${type}`);
        }

        const payload: MetricsPayload = {
            clientId: this.getClientId(),
            type,
            timestamp: new Date().getTime(),
            data: {}
        };

        metrics.forEach(m => {
            payload.data[m.identifier] = m.collect();
        });

        return this.publisher.publish(payload);
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
      return localStorage.getItem(MetricsService.CLIENT_ID_KEY);
    }

    protected saveClientId(id: string): void {
      localStorage.setItem(MetricsService.CLIENT_ID_KEY, id);
    }
}
