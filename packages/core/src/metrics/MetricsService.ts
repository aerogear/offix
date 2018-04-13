import uuid from "uuid/v1";
import { ServiceConfiguration } from "../configuration";
import { Metrics, MetricsPayload, MetricsType } from "./model";
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

    get metricsPublisher(): MetricsPublisher {
        return this.publisher;
    }

    /**
     * Collect metrics for all active metrics collectors
     * Send data using metrics publisher
     */
    public abstract sendAppAndDeviceMetrics(): Promise<any>;

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
        let clientId: string = this.getSavedClientId();

        if (!clientId) {
            clientId = uuid();
            this.saveClientId(clientId);
        }

        return clientId;
    }

    protected abstract getSavedClientId(): string;
    protected abstract saveClientId(id: string): void;
}
