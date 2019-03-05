import { ConflictResolutionStrategy, ConflictResolutionStrategies } from "../conflicts/ConflictResolutionStrategy";
import { PersistedData, PersistentStore } from "../PersistentStore";
import { NetworkStatus } from "../offline";
import { OfflineQueueListener } from "../offline";
import { AuthContextProvider } from "../auth/AuthContextProvider";
import { ObjectState } from "../conflicts/ObjectState";
import { ConflictListener } from "../conflicts/ConflictListener";
import { ConfigurationService } from "@aerogear/core";
import { shouldRetryFn } from "../offline/RetriableOperation";

/**
 * Contains all configuration options required to initialize Voyager Client
 * Options marked with [Modifier] flag are used to modify behavior of client.
 * SDK provides default values for all [Modifier] flags.
 * Users do not need to pass them for normal initialization of the client.
 * Please refer to documentation for more information about the individual flag and it's side effects.
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
   * [Modifier]
   *
   * The storage you want your client to use (Uses window.localStorage by default)
   */
  storage?: PersistentStore<PersistedData>;

  /**
   * [Modifier]
   *
   * Interface for detecting changes in network status.
   * See `WebNetworkStatus` and `CordovaNetworkStatus`
   */
  networkStatus?: NetworkStatus;

  /**
   * [Modifier]
   *
   * The name to store requests under in your offline queue. By default "offline-mutation-store"
   */
  mutationsQueueName?: string | any;

  /**
   * User provided listener that contains set of methods that can be used to detect
   * when operations were added to queue
   */
  offlineQueueListener?: OfflineQueueListener;

  /**
   * [Modifier]
   *
   * An implementation of AuthContextProvider. If none passed, a default one will be used.
   * The default one doesn't add any headers.
   */
  authContextProvider?: AuthContextProvider;

  /**
   * If set to true, GraphGL requests will include some additional data to audit log in the server side.
   */
  auditLogging?: boolean;

  /**
   * [Modifier]
   *
   * If set to true, GraphGL file uploads will be enabled and supported
   */
  fileUpload?: boolean;

  /**
   * [Modifier]
   *
   * Interface that defines how object state is progressed
   * This interface needs to match state provider supplied on server.
   */
  conflictStateProvider?: ObjectState;

  /**
   * Interface that can be implemented to receive information about the data conflict
   */
  conflictListener?: ConflictListener;

  /**
   * OpenShift specific configuration that provides alternative way to setup
   * http and websocket urls.
   */
  openShiftConfig?: ConfigurationService;

  /**
   * [Modifier]
   *
   * The conflict resolution strategy your client should use. By default it takes client version.
   */
  conflictStrategy?: ConflictResolutionStrategies;

  /**
   * [Modifier]
   *
   * Function that overrides retry mechanism for offline mutations that failed on network errors.
   * See https://www.apollographql.com/docs/link/links/retry.html for more information
   */
  shouldRetry?: shouldRetryFn;

}
