import { NetworkStatus, NetworkStatusChangeCallback } from "./NetworkStatus";

declare var document: any;
declare var navigator: any;

/**
 * Cordova networks status implementation based on: cordova-plugin-network-information
 * See: https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-network-information/#constants
 */
export class CordovaNetworkStatus implements NetworkStatus {
  // https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-network-information/#constants
  private NONE = "No network connection";

  public onStatusChangeListener(callback: NetworkStatusChangeCallback): void {
    const networkInfo = {
      online: !this.isOffline()
    };

    if (document) {
      document.addEventListener("online", () => callback.onStatusChange(networkInfo), false);
      document.addEventListener("offline", () => callback.onStatusChange(networkInfo), false);
    }
  }

  public isOffline(): boolean {
    return (navigator.connection.type !== this.NONE);
  }
}
