import console from "loglevel";
import { AppMetrics, Metrics } from "../model";

// tslint:disable-next-line:no-var-requires
const version = require("../../../package.json").version;

declare var window: any;
declare var document: any;

export class CordovaAppMetrics implements Metrics {

  public identifier = "app";

  private cachedPayload: any = undefined;

  /**
   * Get app metrics, to be called after deviceReady event.
   *
   * It uses cordova-plugin-app-version to get the app version, the rest of the metrics are to be
   * filled up by the app itself.
   * @returns {Promise<AppMetrics>} A promise containing the app metrics
   */
  public collect(): Promise<AppMetrics> {
    return new Promise((resolve, reject) => {
      if (this.cachedPayload) {
        return resolve(this.cachedPayload);
      }

      if (!document) {
        return Promise.reject(new Error("Metrics not running in browser environment"));
      }
      document.addEventListener("deviceready", () => {
        if (!window || !window.cordova || !window.cordova.getAppVersion) {
          return reject(
            "Missing required plugin to collect metrics. Verify the " +
            "@aerogear/cordova-plugin-aerogear-metrics plugin is installed."
          );
        }
        const app = window.cordova.getAppVersion;
        Promise.all([
          app.getPackageName(),
          app.getVersionNumber()
        ])
          .then((results) => {
            this.cachedPayload = {
              appId: results[0],
              appVersion: results[1],
              sdkVersion: version,
              framework: "cordova"
            };
            resolve(this.cachedPayload);
          });
      }, false);
    });
  }
}
