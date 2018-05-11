import { DeviceMetrics, Metrics } from "../model";

declare var window: any;

export class CordovaDeviceMetrics implements Metrics {

  public identifier = "device";

  /**
   * Get device metrics, to be called after deviceReady event
   *
   * It uses cordova-plugin-device plugin.
   * @returns {Promise<DeviceMetrics>} The device metrics
   */
  public collect(): Promise<DeviceMetrics> {
    if (!window || !window.device) {
      return Promise.reject("Missing required plugin to collect metrics");
    }
    return Promise.resolve({
      platform: window.device.platform,
      platformVersion: window.device.version,
      device: window.device.model
    });
  }
}
