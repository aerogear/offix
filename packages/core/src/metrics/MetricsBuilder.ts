import console from "loglevel";
import uuid from "uuid/v1";

import { isMobileCordova } from "../PlatformUtils";
import { Metrics } from "./model";
import { CordovaAppMetrics } from "./platform/CordovaAppMetrics";
import { CordovaDeviceMetrics } from "./platform/CordovaDeviceMetrics";
declare var window: any;

export class MetricsBuilder {

  public static readonly CLIENT_ID_KEY = "aerogear_metrics_client_key";

  /**
   * Generates or gets mobile client id
   */
  public getClientId(): string {
    let clientId = this.getSavedClientId();

    if (!clientId) {
      clientId = uuid();
      this.saveClientId(clientId);
    }

    return clientId;
  }

  public getSavedClientId(): string | undefined {
    return window.localStorage.getItem(MetricsBuilder.CLIENT_ID_KEY);
  }

  public saveClientId(id: string): void {
    window.localStorage.setItem(MetricsBuilder.CLIENT_ID_KEY, id);
  }

  /**
   * Builds array of default metrics objects that are sent to server on every request.
   * Other platforms can override this method to provide custom behavior
   */
  public buildDefaultMetrics(): Metrics[] {
    if (isMobileCordova()) {
      return [new CordovaAppMetrics(), new CordovaDeviceMetrics()];
    } else {
      // No support of other platforms in default implementation.
      // Please extend MetricsService class.
      console.warn("Current platform is not supported by metrics.");
      return [];
    }
  }
}
