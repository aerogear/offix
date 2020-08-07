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
  private wsInitialized?: boolean;

  private isConnected?: boolean;
  private online?: boolean;
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
  initialize(subscriptionClient?: SubscriptionClient) {
    if (!subscriptionClient) {
      this.wsInitialized = false;
      return;
    }

    this.wsObservable = new Observable((observer) => {
      subscriptionClient.onConnected(() => {
        observer.next({
          isConnected: true
        });
        this.wsInitialized = true;
      });
      subscriptionClient.onDisconnected(() => observer.next({ isConnected: false }));
      subscriptionClient.onReconnected(() => observer.next({ isConnected: true }));
    });
    this.wsObservable.subscribe((x) => this.isConnected = x.isConnected);
    this.networkStatus.subscribe((x: NetworkStatusEvent) => this.online = x.isOnline);
  }

  public isNetworkReachable() {
    if (this.wsInitialized) {
      return this.online && this.isConnected
    } else {
      this.online;
    }
  }
  public subscribe(observer: ZenObservable.Observer<NetworkStatusEvent>): ZenObservable.Subscription {
    return this.networkStatus.subscribe(observer);
  }

  public isWSConnected() {
    return !!this.isConnected;
  }

  public async isOnline(): Promise<boolean> {
    return this.networkStatus.isOnline();
  }
}
