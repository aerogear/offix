import { NetworkStatus, NetworkStatusEvent } from "./NetworkStatus";
import Observable from "zen-observable";
import NetInfo from "@react-native-community/netinfo";

/**
 * Uses web api to detect network status changes
 */
export class NativeNetworkStatus implements NetworkStatus {

  public observable: Observable<NetworkStatusEvent>;

  constructor() {
    this.observable = new Observable((observer) => {
      NetInfo.addEventListener((state) => observer.next({ isOnline: state.isConnected }));
    });
  }

  public subscribe(observer: ZenObservable.Observer<NetworkStatusEvent>) {
    return this.observable.subscribe(observer);
  }

  public isOnline(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      NetInfo.fetch()
        .then((state) => resolve(state.isConnected))
        .catch((err) => reject(err));
    });
  }
}
