import { AppMetrics, Metrics } from "../model";

export class CordovaAppMetrics implements Metrics {

  public identifier = "app";

  public collect() {
    const payload: AppMetrics = {
      appId: "",
      appVersion: "",
      sdkVersion: ""
    };
    return payload;
  }
}
