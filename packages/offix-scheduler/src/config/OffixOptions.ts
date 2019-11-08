import { OfflineQueueListener } from "offix-offline";
import { PersistedData, PersistentStore } from "offix-offline";
import { NetworkStatus } from "offix-offline";
import { OffixExecutor } from "../Offix";
import { OfflineStoreSerializer } from "offix-offline/types/offline/storage/OfflineStoreSerializer";

/**
 * The options that can be passed by a user to initialize the OffixScheduler
 * Options marked with [Modifier] flag are used to modify behavior of the scheduler
 * Default values are provided for all [Modifier] flags.
 */
export interface OffixOptions {

  /**
   * [Modifier]
   *
   * A class or object with an 'execute' function.
   * This is the core function you want to be able to schedule while offline.
   * It could be a HTTP call, A GraphQL request, send a message.
   */
  executor?: OffixExecutor;

  /**
   * [Modifier]
   *
   * The storage you want your client to use (Uses IndexedDB by default)
   */
  storage?: PersistentStore<PersistedData>;

  /**
   * [Modifier]
   *
   * An object or class that has methods for:
   * 1. serializing objects from the offline queue to storage.
   * 2. deserializing objects from storage back to the queue.
   *
   * The objects being serialized/deserialized are based on what's passed to `execute`.
   * If your objects are simple JSON objects that don't have any functions or circular references
   * Then you probably don't need a custom serializer.
   */
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
