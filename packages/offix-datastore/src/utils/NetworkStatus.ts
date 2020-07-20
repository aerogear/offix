import Observable from "zen-observable";
import { SubscriptionClient } from "subscriptions-transport-ws";

/**
 * Network status event
 */
enum Network {
  CONNECTED,
  DISCONNECTED,
  INITIALISING
}

/**
 * Interface for a specific NetworkEvent. This interface defines the structure
 * of the payload used in the NetworkStatus subscriber when the client
 * connects, disconnects or reconnects to the internet.
 */
export interface NetworkEvent {
  /**
   * Network event type (INITIALISING, CONNECTED, DISCONNECTED)
   */
  event: Network;
  /**
   * Connection status
   */
  status: boolean;
};

/**
 * Responsible for handling network change events.
 */
export interface NetworkStatusInterface {
  /** Indicator for whether the client is online or not */
  isOnline: boolean;
  /** An observable NetworkEvent that can be subscribed to */
  subscriber: Observable<NetworkEvent>;
  /** Function for subscribing to the observable NetworkEvent */
  subscribe: (observer: any) => void;
  /** Unsubscribe to prevent memory leaks */
  unsubscribe: () => void;
}

/**
 * The default implementation of the NetworkStatus listener
 * uses the websocket connection to the server to detect
 * changes in the network status and use this as an indicator
 * of the network status of the client.
 */
export class NetworkStatus implements NetworkStatusInterface {

  public isOnline: boolean = false;
  public subscriber: Observable<NetworkEvent>;

  public constructor(subscriptionClient: SubscriptionClient) {
    this.subscriber = new Observable((observer) => {
      observer.next({ event: Network.INITIALISING, status: false });
      subscriptionClient.onConnected(() => observer.next({ event: Network.CONNECTED, status: true }));
      subscriptionClient.onDisconnected(() => observer.next({ event: Network.DISCONNECTED, status: false }));
      subscriptionClient.onReconnected(() => observer.next({ event: Network.CONNECTED, status: true }));
    });
    this.subscriber.subscribe((x: NetworkEvent) => this.isOnline = x.status);
  }

  public subscribe(observer: any) {
    this.subscriber.subscribe(observer);
  }

  public unsubscribe() {
    // TODO
  }

}
