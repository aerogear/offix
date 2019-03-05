import { NetworkStatus, NetworkStatusChangeCallback } from "./NetworkStatus";

declare var window: any;

/**
 * Web networks status implementation based on: Mozilla
 * See: https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/onLine
 */
export class WebNetworkStatus implements NetworkStatus {
  public onStatusChangeListener(callback: NetworkStatusChangeCallback): void {
    if (window) {
      window.addEventListener("online", () => callback.onStatusChange({online: true}), false);
      window.addEventListener("offline", () => callback.onStatusChange({online: false}), false);
    }
  }

  public isOffline(): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(!window.navigator.onLine);
    });
  }
}
