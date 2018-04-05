import axios from "axios";
import { MetricsPayload } from "../model";
import { MetricsPublisher } from "./";

/**
 * Metrics publisher that sends payload to remote server
 * Publisher requires remote server URL
 */
export class NetworkMetricsPublisher implements MetricsPublisher {

  constructor(private url: string) {
  }

  /**
   * Allows to publish metrics to external source
   */
  public publish(payload: MetricsPayload): Promise<any> {
    return axios.post(this.url, payload);
  }

}
