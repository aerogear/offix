export interface NetworkInfo {
  online: boolean;
}

export type NetworkStatusChangeCallback = (info: NetworkInfo) => void;

/**
 * Responsable to handle Networks status
 */
export interface NetworkStatus {
  /**
   * Register callback whenever the network status change
   *
   * @param callback Callback to be added when network status change
   */
  addListener(listener: NetworkStatusChangeCallback): void;

  /**
   * Remove callback whenever the network status change
   *
   * @param callback Callback to be removed when network status change
   */
  removeListener(listener: NetworkStatusChangeCallback): void;

  /**
   * Check if device is offline
   */
  isOffline(): Promise<boolean>;
}
