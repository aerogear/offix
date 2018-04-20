import { DeviceMetrics, Metrics } from "../model";

export class CordovaDeviceMetrics implements Metrics {

  public identifier = "device";

  public collect() {
    const payload: DeviceMetrics = {
      platform: "",
      platformVersion: "",
      device: ""
    };
    return payload;
  }
}
