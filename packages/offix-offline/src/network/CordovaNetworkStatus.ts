import { NetworkStatus, NetworkStatusChangeCallback } from "./NetworkStatus";

declare let document: any;

/**
 * Cordova networks status implementation based on: cordova-plugin-network-information
 * See: https://cordova.apache.org/docs/en/latest/reference/cordova-plugin-network-information
 */
export class CordovaNetworkStatus implements NetworkStatus {

  listeners: NetworkStatusChangeCallback[] = [];

  constructor() {
    document.addEventListener("online", this.handleNetworkStatusChange.bind(this), false);
    document.addEventListener("offline", this.handleNetworkStatusChange.bind(this), false);
  }

  public onStatusChangeListener(listener: NetworkStatusChangeCallback): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: NetworkStatusChangeCallback): void {
    const index = this.listeners.indexOf(listener);
    if (index > 0) {
      this.listeners.splice(index, 1);
    }
  }

  public isOffline(): Promise<boolean> {
    return new Promise((resolve) => {
      document.addEventListener("deviceready", () => {
        resolve(!window.navigator.onLine);
      }, false);
    });
  }

  private handleNetworkStatusChange() {
    const online = window.navigator.onLine;
    this.listeners.forEach((listener) => {
      listener.onStatusChange({ online });
    });
  }

}
