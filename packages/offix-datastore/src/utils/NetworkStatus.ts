import Observable from "zen-observable";
import { SubscriptionClient } from "subscriptions-transport-ws";

export interface NetworkEvent {
  /**
   * Network event type
   */
  event: string;
  /**
   * Connection status
   */
  status: boolean;
};

export class NetworkStatus {

  public isOnline: boolean = false;
  public subscriber: Observable<NetworkEvent>;

  public constructor(subscriptionClient: SubscriptionClient) {
    this.subscriber = new Observable((observer) => {
      observer.next({ event: "initialising", status: false });
      subscriptionClient.onConnected(() => observer.next({ event: "connected", status: true }));
      subscriptionClient.onDisconnected(() => observer.next({ event: "disconnected", status: false }));
      subscriptionClient.onReconnected(() => observer.next({ event: "reconnected", status: true }));
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
