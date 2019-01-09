import { ConflictResolutionStrategy } from "../conflicts/ConflictResolutionStrategy";
import { LinkChainBuilder } from "../links";
import { PersistedData, PersistentStore } from "../PersistentStore";
import { NetworkStatus } from "../offline";
import { OfflineQueueListener } from "../offline";
import { HeaderProvider } from "./HeaderProvider";
import { NextState } from "../conflicts/NextState";
import { ConflictListener } from "../conflicts/ConflictListener";

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
  offlineQueueListener?: OfflineQueueListener;

  /**
   * An implementation of HeaderProvider. If none passed, a default one will be used.
   * The default one doesn't add any headers.
   */
  headerProvider?: HeaderProvider;


  /**
   * If set to true, GraphGL requests will include some additional data to audit log in the server side.
   */
  auditLogging?: boolean;

  /**
   * Conflict resolution strategy
   */
  conflictStrategy?: ConflictResolutionStrategy;

  /**
   * Interface that defines how object state is progressed
   */
  conflictStateProvider?: NextState;

  /**
   * Interface that can be implemented to receive information about the data conflict
   */
  conflictListener?: ConflictListener;
}
