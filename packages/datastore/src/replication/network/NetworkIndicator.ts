import Observable from "zen-observable";
import { SubscriptionClient } from "subscriptions-transport-ws";
import { NetworkStatusEvent, NetworkStatus } from "./NetworkStatus";

/**
 * The default implementation of the NetworkStatus listener
 * uses the websocket connection to the server to detect
 * changes in the network status and use this as an indicator
 * of the network status of the client.
 */
export class NetworkIndicator implements NetworkStatus {
  public wsObservable?: Observable<{ isConnected: boolean }>;
  private wsEnabled?: boolean;
  private isConnected?: boolean;
  private networkStatus: NetworkStatus;

  /**
   * @param networkStatus - platform dependent network status
   * that indicaes device getting lost of the wifi or mobile data access
   */
  public constructor(networkStatus: NetworkStatus) {
    this.networkStatus = networkStatus;
    this.isConnected = false;
  }

  /**
   * Initializes network indicator with additional subscription client that can be used to
   * detect network state.
   *
   * @param subscriptionClient client that can be used to control subscription state
   */
  public initialize(subscriptionClient?: SubscriptionClient) {
    if (!subscriptionClient) {
      this.wsEnabled = false;
      return;
    }
    this.wsObservable = new Observable((observer) => {
      subscriptionClient.onConnected(() => {
        observer.next({
          isConnected: true
        });
        this.wsEnabled = true;
      });
      subscriptionClient.onDisconnected(() => observer.next({ isConnected: false }));
      subscriptionClient.onReconnected(() => observer.next({ isConnected: true }));
    });
    this.wsObservable.subscribe((x) => this.isConnected = x.isConnected);
  }

  /**
   * Using system indicator to check if app is connected
   */
  public async isOnline(): Promise<boolean> {
    return this.networkStatus.isOnline();
  }

  /**
   * Using subscriptions to check if app is connected (if subscriptions are enabled)
   */
  public async isNetworkReachable() {
    if (this.wsEnabled && this.isConnected !== undefined) {
      return await this.networkStatus.isOnline() && this.isConnected;
    } else {
      return await this.networkStatus.isOnline();
    }
  }
  public subscribe(observer: ZenObservable.Observer<NetworkStatusEvent>): ZenObservable.Subscription {
    return this.networkStatus.subscribe(observer);
  }
}
