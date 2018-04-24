import { MetricsPayload } from "../model";
import { MetricsPublisher } from "./MetricsPublisher";

export class LogMetricsPublisher implements MetricsPublisher {

  public publish(metrics: MetricsPayload): Promise<any> {
    return new Promise((res, rej) => {
      console.info("Metrics: ", metrics);
      res();
    });
  }

}
