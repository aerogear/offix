/**
 * Interface for a specific NetworkEvent. This interface defines the structure
 * of the payload used in the NetworkStatus subscriber when the client
 * connects, disconnects or reconnects to the internet.
 */
export interface NetworkStatusEvent {

  /**
   * Flag used to detect if we are online and ready to make requests
   * Note that this reqests can still fail, but we want to prevent from engaging
   * any network activity where we definietly know that they going to fail.
   */
  isOnline: boolean;
};

/**
* Responsible for handling network change events.
*/
export interface NetworkStatus {
  /** Indicator for whether the client is online or not */
  isOnline(): Promise<boolean>;
  /** Function for subscribing to the observable NetworkEvent */
  subscribe: (observer: ZenObservable.Observer<NetworkStatusEvent>) => ZenObservable.Subscription;
}
