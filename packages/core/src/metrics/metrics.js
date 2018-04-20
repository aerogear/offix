const MetricsService = cordova.require("core.core").MetricsService;

const MOBILE_CORE_CLASS = "MobileCoreModule";

/**
 * Represents a Metrics object
 * @private
 * @example
 * var appMetrics = new MetricsImpl("app", { platform: "android" });
 */
class MetricsImpl {

  /**
   * Create a Metrics object.
   * @param {string} id - A name identifying the kind of metrics.
   * @param {object} data - An object containing all metrics and its values.
   */
  constructor(id, data) {
    this.id = id;
    this.data = data;
  }

  /**
   * Get all metrics
   * @public
   * @returns {object} An object containing all metrics and its values.
   */
  collect() {
    return this.data;
  }
}

/**
 * Class that exposes the AeroGear metrics SDK for a Cordova application.
 * It is globally available trough 'window.aerogear' or simply 'aerogear', under the name
 * of MetricsService.
 * @public
 * @example
 * var MetricsService = window.aerogear.MetricsService;
 * @example
 * var metricsService = new aerogear.MetricsService({ url: "http://my-service"});
 * metricsService.sendAppAndDeviceMetrics()
 *   .then(handleResponse)
 */
class CordovaMetricsService extends MetricsService {

  /**
   * Get some metrics about the application and device
   * @public
   * @return {Promise} A promise containing an object with the metrics
   */
  getAppAndDeviceMetrics() {
    return new Promise((res, rej) => {
      cordova.exec(
        metrics => {
          const plugins = cordova.require("cordova/plugin_list");
          const sdkVersion = plugins.metadata["core-cordova"];
          metrics.app.sdkVersion = sdkVersion;
          res(metrics);
        },
        rej,
        MOBILE_CORE_CLASS,
        "getAppAndDeviceMetrics"
      );
    });
  }

  /**
   * Send metrics about the application and device to the Metrics service.
   * @public
   * @returns {Promise} A promise containing the response from the server.
   */
  sendAppAndDeviceMetrics() {
    return this.getAppAndDeviceMetrics()
      .then(metrics => {
        const appMetrics = new MetricsImpl("app", metrics.app);
        const deviceMetrics = new MetricsImpl("device", metrics.device);

        return this.publish([appMetrics, deviceMetrics]);
      });
  }

  /**
   * Get the device's client id if it stored, otherwise return undefined.
   * @private
   * @returns {string|undefined} The client id or undefined.
   */
  getSavedClientId() {
    // TODO: get from device storage or return undefined
    return undefined;
  }

  /**
   * Save a string as this device's unique client id, so it can be identified by any AeroGear service.
   * @private
   * @param {string} id - The id to be saved
   */
  saveClientId(id) {
    // TODO: store in device storage
    return;
  }

};

exports.MetricsService = CordovaMetricsService;
