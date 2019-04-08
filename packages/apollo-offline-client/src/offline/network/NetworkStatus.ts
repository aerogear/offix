export interface NetworkInfo {
  online: boolean;
}

export interface NetworkStatusChangeCallback {
  onStatusChange(info: NetworkInfo): void;
}

/**
 * Responsable to handle Networks status
 */
export interface NetworkStatus {
  /**
   * Trigger callback whenever the network status change
   *
   * @param callback Callback to be called when network status change
   */
  onStatusChangeListener(callback: NetworkStatusChangeCallback): void;

  /**
   * Check if device is offline
   */
  isOffline(): Promise<boolean>;
}
