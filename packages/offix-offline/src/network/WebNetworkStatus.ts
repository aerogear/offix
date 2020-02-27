import { NetworkStatus, NetworkStatusChangeCallback } from "./NetworkStatus";

declare let window: any;

/**
 * Web networks status implementation based on: Mozilla
 * See: https://developer.mozilla.org/en-US/docs/Web/API/NavigatorOnLine/onLine
 */
export class WebNetworkStatus implements NetworkStatus {

  listeners: NetworkStatusChangeCallback[] = [];

  constructor() {
    window.addEventListener("online", this.handleNetworkStatusChange.bind(this), false);
    window.addEventListener("offline", this.handleNetworkStatusChange.bind(this), false);
  }

  public addListener(listener: NetworkStatusChangeCallback): void {
    this.listeners.push(listener);
  }

  public removeListener(listener: NetworkStatusChangeCallback): void {
    const index = this.listeners.indexOf(listener);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  public isOffline(): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(!window.navigator.onLine);
    });
  }

  private handleNetworkStatusChange() {
    const online = window.navigator.onLine;
    this.listeners.forEach((listener) => {
      listener({ online });
    });
  }
}
