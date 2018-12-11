import { ConflictResolutionStrategy } from "../conflicts";
import { LinkChainBuilder } from "../links";
import { PersistedData, PersistentStore } from "../PersistentStore";
import { NetworkStatus } from "../offline";
import { OfflineQueueListener } from "../offline/OfflineQueueListener";

/**
 * Contains all configuration options required to initialize SDK
 *
 * @see DefaultOptions for defaults
 */
export interface DataSyncConfig {
  /**
   * Http server url
   */
  httpUrl?: string;

  /**
   * Websocket url
   */
  wsUrl?: string;

  /**
   * Storage solution
   */
  storage?: PersistentStore<PersistedData>;

  /**
   * Conflict resolution strategy
   */
  conflictStrategy?: ConflictResolutionStrategy;

  /**
   * Enables providing custom Apollo Link for processing requests
   */
  customLinkBuilder?: LinkChainBuilder;

  /**
   * Inteface for detecting changes in network status
   */
  networkStatus?: NetworkStatus;

  /**
   * The key used to store offline mutations
   */
  mutationsQueueName?: string | any;

  /**
   * Whether or not to enable squashing offline mutations
   */
  mergeOfflineMutations?: boolean;

  /**
   * User provided listener that contains set of methods that can be used to detect
   * when operations were added to queue
   */
  offlineQueueListener: OfflineQueueListener;
}
