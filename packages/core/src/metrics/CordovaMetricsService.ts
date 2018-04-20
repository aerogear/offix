import uuid from "uuid/v1";
import { ServiceConfiguration } from "../configuration";
import { MetricsService } from "./MetricsService";
import { Metrics, MetricsPayload, MetricsType } from "./model";
import { MetricsPublisher, NetworkMetricsPublisher } from "./publisher";

declare var localStorage: any;

/**
 * AeroGear Services metrics service
 */
export class CordovaMetricsService extends MetricsService {

    protected  buildDefaultMetrics(): Metrics[] {
      return [];
    }
}
