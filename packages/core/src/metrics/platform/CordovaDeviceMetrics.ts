import { DeviceMetrics, Metrics } from "../model";

declare var window: any;
declare var document: any;

export class CordovaDeviceMetrics implements Metrics {

  public identifier = "device";

  /**
   * Get device metrics, to be called after deviceReady event
   *
   * It uses cordova-plugin-device plugin.
   * @returns {Promise<DeviceMetrics>} The device metrics
   */
  public collect(): Promise<DeviceMetrics> {
    return new Promise((resolve, reject) => {
      if (!document) {
        return Promise.reject("Metrics not running in browser environment");
      }
      document.addEventListener("deviceready", () => {
        if (!window || !window.device) {
          return reject("Missing required plugin to collect metrics");
        }
        return resolve({
          platform: window.device.platform,
          platformVersion: window.device.version,
          device: window.device.model
        });
      }, false);
    });
  }
}
