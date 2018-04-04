const exec = require("cordova/exec");

const MOBILE_CORE_CLASS = "MobileCoreModule";

const MetricsService = {
  getMetrics: function (success, error) {
    exec(success, error, MOBILE_CORE_CLASS, "getMetrics");
  }
};

const MobileCore = {
  MetricsService
};

window.MobileCore = MobileCore;
