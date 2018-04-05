import { ServiceConfiguration } from "../configuration";
import { Metrics, MetricsPayload } from "./model";
import { MetricsPublisher, NetworkMetricsPublisher } from "./publisher";

/**
 * AeroGear Services metrics service
 */
export abstract class MetricsService {

    private publisher: MetricsPublisher;

    constructor(private readonly configuration: ServiceConfiguration) {
        this.publisher = new NetworkMetricsPublisher(configuration.url);
    }

    set metricsPublisher(publisher: MetricsPublisher) {
        this.publisher = publisher;
    }

    /**
     * Collect metrics for all active metrics collectors
     * Send data using metrics publisher
     */
    public abstract sendAppAndDeviceMetrics(): Promise<any>;

    /**
     * Generates or gets mobile client id
     */
    public abstract getClientId(): string;

    /**
     * Publish metrics using predefined publisher
     *
     * @param - metrics instances that should be published
     */
    public publish(metrics: Metrics[]): Promise<any> {
        const payload: MetricsPayload = {
            clientId: this.getClientId(),
            timestamp: new Date().getTime(),
            data: {}
        };

        metrics.forEach(m => {
            payload.data[m.identifier] = m.collect();
        });

        return this.publisher.publish(payload);
    }

}
