const MetricsService = cordova.require("core.core").MetricsService;

const MOBILE_CORE_CLASS = "MobileCoreModule";

class MetricsImpl {

  constructor(id, data) {
    this.id = id;
    this.data = data;
  }

  collect() {
    return this.data;
  }
}

class CordovaMetricsService extends MetricsService {

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
        "getMetrics"
      );
    });
  }

  sendAppAndDeviceMetrics() {
    return this.getAppAndDeviceMetrics()
      .then(metrics => {
        const appMetrics = new MetricsImpl("app", metrics.app);
        const deviceMetrics = new MetricsImpl("device", metrics.device);

        return this.publish([appMetrics, deviceMetrics]);
      });
  }

  getSavedClientId() {
    // TODO: get from device storage or return undefined
    return undefined;
  }

  saveClientId(id) {
    // TODO: store in device storage
    return;
  }

};

exports.MetricsService = CordovaMetricsService;
