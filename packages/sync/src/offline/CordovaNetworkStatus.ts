import { NetworkStatus, NetworkStatusChangeCallback } from "./NetworkStatus";

declare var document: any;

/**
 * Cordova networks status implementation based on: cordova-plugin-network-information
 * See: https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-network-information
 */
export class CordovaNetworkStatus implements NetworkStatus {
  public onStatusChangeListener(callback: NetworkStatusChangeCallback): void {
    if (document) {
      document.addEventListener("online", () => callback.onStatusChange({online: true}), false);
      document.addEventListener("offline", () => callback.onStatusChange({online: false}), false);
    }
  }

  public isOffline(): boolean {
    return !window.navigator.onLine;
  }
}
