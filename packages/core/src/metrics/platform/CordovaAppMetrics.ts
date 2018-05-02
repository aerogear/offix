import { AppMetrics, Metrics } from "../model";

// tslint:disable-next-line:no-var-requires
const version = require("../../../package.json").version;

declare var cordova: any;

export class CordovaAppMetrics implements Metrics {

  public identifier = "app";

  /**
   * Get app metrics, to be called after deviceReady event.
   *
   * It uses cordova-plugin-app-version to get the app version, the rest of the metrics are to be
   * filled up by the app itself.
   * @returns {Promise<AppMetrics>} A promise containing the app metrics
   */
  public collect(): Promise<AppMetrics> {
    const app = cordova.getAppVersion;

    return Promise.all([
      app.getPackageName(),
      app.getVersionNumber()
    ])
      .then(results => ({
        appId: results[0],
        appVersion: results[1],
        sdkVersion: version
      }));
  }
}
