import { NetworkStatus, NetworkStatusEvent } from "./NetworkStatus";
import Observable from "zen-observable";

/**
 * Uses web api to detect network status changes
 */
export class WebNetworkStatus implements NetworkStatus {

  public observable: Observable<NetworkStatusEvent>;


  constructor() {
    this.observable = new Observable((observer) => {
      window.addEventListener("online", () => observer.next({ isOnline: window.navigator.onLine }));
      window.addEventListener("offline", () => observer.next({ isOnline: window.navigator.onLine }));
    });
  }


  public subscribe(observer: ZenObservable.Observer<NetworkStatusEvent>) {
    return this.observable.subscribe(observer);
  }

  public isOnline(): Promise<boolean> {
    return new Promise((resolve) => {
      resolve(window.navigator.onLine);
    });
  }
}
