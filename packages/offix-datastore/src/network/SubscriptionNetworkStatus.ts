import Observable from "zen-observable";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { NetworkStatusEvent } from "./NetworkStatus";
import { WebNetworkStatus } from "./WebNetworkStatus";


/**Î
 * The default implementation of the NetworkStatus listener
 * uses the websocket connection to the server to detect
 * changes in the network status and use this as an indicator
 * of the network status of the client.
 */
export class SubscriptionNetworkStatus extends WebNetworkStatus {
  public subscriber: Observable<NetworkStatusEvent>;
  private isOnlineFlag?: boolean;

  public isNetworkReachable() {
    return Promise.resolve(true);
  }

  public constructor(subscriptionClient: SubscriptionClient) {
    super();
    this.subscriber = new Observable((observer) => {
      subscriptionClient.onConnected(() => observer.next({ isOnline: true }));
      subscriptionClient.onDisconnected(() => observer.next({ isOnline: false }));
      subscriptionClient.onReconnected(() => observer.next({ isOnline: true }));
    });
    this.subscriber.subscribe((x: NetworkStatusEvent) => this.isOnlineFlag = x.isOnline);
  }

  public isOnline(): Promise<boolean> {
    if (this.isOnlineFlag === undefined) {
      return super.isOnline();
    }
    return Promise.resolve(super.isOnline() && this.isOnlineFlag);
  }

  public subscribe(observer: ZenObservable.Observer<NetworkStatusEvent>) {
    return this.subscriber.subscribe(observer);
  }
}
