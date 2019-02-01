import { ConflictResolutionStrategy } from "../conflicts/ConflictResolutionStrategy";
import { PersistedData, PersistentStore } from "../PersistentStore";
import { NetworkStatus } from "../offline";
import { OfflineQueueListener } from "../offline";
import { HeaderProvider } from "./HeaderProvider";
import { NextState } from "../conflicts/NextState";
import { ConflictListener } from "../conflicts/ConflictListener";
import { ConfigurationService } from "@aerogear/core";

/**
 * Contains all configuration options required to initialize SDK
 *
 * @see DefaultOptions for defaults
 */
export interface DataSyncConfig {
  /**
   * The URL of http server
   */
  httpUrl?: string;

  /**
   *  The URL of websocket endpoint
   */
  wsUrl?: string;

  /**
   * The storage you want your client to use (Uses window.localStorage by default)
   */
  storage?: PersistentStore<PersistedData>;

  /**
   * Interface for detecting changes in network status.
   * See `WebNetworkStatus` and `CordovaNetworkStatus`
   */
  networkStatus?: NetworkStatus;

  /**
   * The name to store requests under in your offline queue. By default "offline-mutation-store"
   */
  mutationsQueueName?: string | any;

  /**
   * Whether or not you wish to squash mutations in your queue. By default true
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
   * The conflict resolution strategy your client should use. By default it takes client version
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

  /**
   * OpenShift specific configuration
   */
  openShiftConfig?: ConfigurationService;
}
