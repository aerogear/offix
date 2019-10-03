import { ConflictResolutionStrategy } from "offix-offline";
import { PersistedData, PersistentStore } from "offix-offline";
import { NetworkStatus } from "offix-offline";
import { ObjectState } from "offix-offline";
import { ConflictListener } from "offix-offline";
import { CacheUpdates } from "offix-cache";
import { RetryLink } from "apollo-link-retry";
import { ApolloLink } from "apollo-link";
import { ApolloOfflineQueueListener } from "../apollo";

/**
 * Contains all configuration options required to initialize Voyager Client
 * Options marked with [Modifier] flag are used to modify behavior of client.
 * SDK provides default values for all [Modifier] flags.
 * Users do not need to pass them for normal initialization of the client.
 * Please refer to documentation for more information about the individual flag and it's side effects.
 *
 */
export interface OffixClientConfig {

  /**
   * The URL of http server that will be used to initialize default http link
   * Value is ignored if terminating link is passed
   */
  httpUrl?: string;

  /**
   * [Modifier]
   * Apollo link that will be passed to created client
   */
  terminatingLink?: ApolloLink;

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
   * User provided listener that contains set of methods that can be used to detect
   * when operations were added to queue
   */
  offlineQueueListener?: ApolloOfflineQueueListener;

  /**
   * [Modifier]
   *
   * Interface that defines how object state is progressed
   * This interface needs to match state provider supplied on server.
   */
  conflictProvider?: ObjectState;

  /**
   * Interface that can be implemented to receive information about the data conflict
   *
   * @deprecated see OfflineClient.registerOfflineEventListener
   */
  conflictListener?: ConflictListener;

  /**
   * [Modifier]
   *
   * The conflict resolution strategy your client should use. By default it takes client version.
   */
  conflictStrategy?: ConflictResolutionStrategy;

  /**
   * [Modifier]
   *
   * Cache updates functions for your mutations
   * Argument allows to restore optimistic responses on application restarts.
   */
  mutationCacheUpdates?: CacheUpdates;

  /**
   * [Modifier]
   *
   * The options to configure how failed offline mutations are retried.
   *
   */
  retryOptions?: RetryLink.Options;
}
