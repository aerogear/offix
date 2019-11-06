import { OfflineQueueListener } from "offix-offline";
import { PersistedData, PersistentStore } from "offix-offline";
import { NetworkStatus } from "offix-offline";
import { OffixExecutor } from "../Offix";
import { OfflineStoreSerializer } from "offix-offline/types/offline/storage/OfflineStoreSerializer";

/**
 * Contains all configuration options required to initialize Voyager Client
 * Options marked with [Modifier] flag are used to modify behavior of client.
 * SDK provides default values for all [Modifier] flags.
 * Users do not need to pass them for normal initialization of the client.
 * Please refer to documentation for more information about the individual flag and it's side effects.
 *
 */
export interface OffixOptions {

  executor?: OffixExecutor;

  /**
   * [Modifier]
   *
   * The storage you want your client to use (Uses window.localStorage by default)
   */
  storage?: PersistentStore<PersistedData>;

  serializer?: OfflineStoreSerializer<any>;

  /**
   * [Modifier]
   *
   * Interface for detecting changes in network status.
   * See `WebNetworkStatus` and `CordovaNetworkStatus`
   */
  networkStatus?: NetworkStatus;

  /**
   * User provided listener that contains set of methods that can be used to detect
   * when operations were added to queue
   */
  offlineQueueListener?: OfflineQueueListener<any>;
}
