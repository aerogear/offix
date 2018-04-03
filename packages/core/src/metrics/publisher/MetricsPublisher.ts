import { MetricsPayload } from "../model/MetricsPayload";

/**
 * Interface for classes that can publish or store metrics payload
 */
export interface MetricsPublisher {

  /**
   * Allows to publish metrics to external source
   */
  publish(payload: MetricsPayload): Promise<any>;

}
