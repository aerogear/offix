import { PersistedData, PersistentStore } from "offix-scheduler";
import {
  NetworkStatus
 } from "offix-offline";
import { CacheUpdates } from "offix-cache";
import { RetryLink } from "apollo-link-retry";
import { ApolloOfflineQueueListener } from "../apollo";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClientOptions } from "apollo-client";
import { CachePersistor } from "apollo-cache-persist";

export interface InputMapper {
  deserialize: (object: any) => any;
  serialize: (object: any) => any;
}

/**
 * Contains all configuration options required to initialize Voyager Client
 * Options marked with [Modifier] flag are used to modify behavior of client.
 * SDK provides default values for all [Modifier] flags.
 * Users do not need to pass them for normal initialization of the client.
 * Please refer to documentation for more information about the individual flag and it's side effects.
 *
 */
export interface ApolloOfflineClientOptions extends ApolloClientOptions<NormalizedCacheObject> {
  /**
   * [Modifier]
   *
   * The storage you want your client to use for the cache
   * Uses window.localStorage by default
   */
  cacheStorage?: PersistentStore<PersistedData>;

  /**
   * [Modifier]
   *
   * The CachePersistor instance that should be used by the client.
   * Pass your own CachePersistor instance to override the default one.
   */
  cachePersistor?: CachePersistor<object>;

  /**
   * [Modifier]
   *
   * The storage you want your client to use for offline operations
   * Uses window.localStorage by default
   */
  offlineStorage?: PersistentStore<PersistedData>;

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

  /**
   * [Modifier]
   *
   * Maps input objects for the cases if variables are not passed to the root
   *
   */
  inputMapper?: InputMapper;
}
