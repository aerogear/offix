import { ApolloClient, OperationVariables, MutationOptions } from "apollo-client";
import { OffixClientOptions } from "./config/OffixClientOptions";
import { OffixClientConfig } from "./config/OffixClientConfig";

import { Offix } from "offix-scheduler";

import {
  ApolloOfflineQueue,
  ApolloOfflineStore,
  ApolloOfflineQueueListener,
  ApolloQueueEntryOperation,
  ApolloOperationSerializer,
  ApolloOfflineClient,
  createCompositeLink,
  addOptimisticResponse,
  removeOptimisticResponse,
  restoreOptimisticResponse,
  replaceClientGeneratedIDsInQueue
} from "./apollo/";

import {
  ApolloCacheWithData,
  getBaseStateFromCache,
  NetworkStatus,
  ConflictLink,
  ObjectState
} from "offix-offline";

import { FetchResult } from "apollo-link";
import { MutationHelperOptions, createMutationOptions } from "offix-cache";
import { InMemoryCache } from "apollo-cache-inmemory";
import { CachePersistor } from "apollo-cache-persist";

/**
* Factory for creating Apollo Offline Client
*
* @param userConfig options object used to build client
* @deprecated use OfflineClient class directly:
*  ```javascript
*  const offlineClient = new OfflineClient(config);
*  await offlineClient.init();
*  ```
*/
export const createClient = async (userConfig: OffixClientOptions):
  Promise<ApolloOfflineClient> => {
  const offlineClient = new OfflineClient(userConfig);
  return offlineClient.init();
};

/**
 * OfflineClient
 *
 * Enables offline workflows, conflict resolution and cache
 * storage on top Apollo GraphQL JavaScript client.
 *
 * Usage:
 *
 *  ```javascript
 *  const offlineClient = new OfflineClient(config);
 *  await offlineClient.init();
 *  ```
 */
export class OfflineClient {

  // the offix client global config
  public config: OffixClientConfig;
  // the network status interface that determines online/offline state
  public networkStatus: NetworkStatus;
  // the offline storage interface that persists offline data across restarts
  public offlineStore?: ApolloOfflineStore;
  // the in memory queue that holds offline data
  public queue: ApolloOfflineQueue;
  // listeners that can be added by the user to handle various events coming from the offline queue
  public queueListeners: ApolloOfflineQueueListener[] = [];
  // The apollo cache that holds application state
  public cache: InMemoryCache;
  // wrapper around the apollo cache for persisting it across restarts
  public persistor?: CachePersistor<object>;
  // The apollo client!
  public apolloClient?: ApolloOfflineClient;

  public offix: Offix;

  constructor(userConfig: OffixClientOptions = {}) {
    this.config = new OffixClientConfig(userConfig);

    if (this.config.cache) {
      if (this.config.cache instanceof InMemoryCache) {
        this.cache = this.config.cache;
      } else {
        throw new Error("Unsupported cache. cache must be an InMemoryCache");
      }
    } else {
      this.cache = new InMemoryCache();
    }

    if (this.config.cacheStorage) {
      this.persistor = new CachePersistor({
        cache: this.cache,
        serialize: false,
        storage: this.config.cacheStorage,
        maxSize: false,
        debug: false
      });
    }

    this.offix = new Offix({
      executor: this,
      storage: this.config.offlineStorage,
      networkStatus: this.config.networkStatus,
      serializer: ApolloOperationSerializer,
      offlineQueueListener: this.config.offlineQueueListener
    });

    this.queue = this.offix.queue;
    this.networkStatus = this.offix.networkStatus;
    this.offlineStore = this.offix.offlineStore;
  }

  /**
  * Initialize client
  */
  public async init(): Promise<ApolloOfflineClient> {
    if (this.persistor) {
      await this.persistor.restore();
    }

    const conflictLink = new ConflictLink({
      conflictProvider: this.config.conflictProvider as ObjectState,
      conflictListener: this.config.conflictListener,
      conflictStrategy: this.config.conflictStrategy
    });

    const link = await createCompositeLink(this.config, conflictLink);

    const client = new ApolloClient({
      link,
      cache: this.cache
    });

    this.apolloClient = this.decorateApolloClient(client);

    // Optimistic Responses
    this.queue.registerOfflineQueueListener({
      onOperationEnqueued: (operation: ApolloQueueEntryOperation) => {
        if (this.apolloClient) {
          addOptimisticResponse(this.apolloClient, operation);
        }
      },
      onOperationSuccess: (operation: ApolloQueueEntryOperation, result: FetchResult) => {
        replaceClientGeneratedIDsInQueue(this.offix.queue.queue, operation, result);
        if (this.apolloClient) {
          removeOptimisticResponse(this.apolloClient, operation);
        }
      },
      onOperationFailure: (operation: ApolloQueueEntryOperation, error) => {
        if (this.apolloClient) {
          removeOptimisticResponse(this.apolloClient, operation);
        }
      },
      onOperationRequeued: (operation: ApolloQueueEntryOperation) => {
        if (this.config.mutationCacheUpdates && this.apolloClient) {
          restoreOptimisticResponse(this.apolloClient, this.config.mutationCacheUpdates, operation);
        }
      }
    });
    await this.offix.init();
    return this.apolloClient;
  }

  public async execute(options: MutationOptions) {
    if (this.apolloClient) {
      return this.apolloClient.mutate(options);
    } else {
      throw new Error("Apollo offline client not initialised before mutation called.");
    }
  }

  /**
   * Offline wrapper for apollo mutations. Provide Mutation Helper Options and use
   * this offline friendly function to handle the optimistic UI and cache updates.
   *
   * @param options the MutationHelperOptions to create the mutation
   */
  public async offlineMutate<T = any, TVariables = OperationVariables>(
    options: MutationHelperOptions<T, TVariables>): Promise<FetchResult<T>> {
    if (!this.apolloClient) {
      throw new Error("Apollo offline client not initialised before mutation called.");
    } else {

      const mutationOptions = this.createOfflineMutationOptions(options);
      return this.offix.execute(mutationOptions);
    }
  }

  /**
   * Add new listener for listening for queue changes
   *
   * @param listener
   */
  public registerOfflineEventListener(listener: ApolloOfflineQueueListener) {
    this.offix.registerOfflineQueueListener(listener);
  }

  // TODO - does offix-cache actually need createMutationOptions?
  // Could we just consolidate that in here?
  protected createOfflineMutationOptions<T = any, TVariables = OperationVariables>(
    options: MutationHelperOptions<T, TVariables>): MutationOptions<T, TVariables> {
    const offlineMutationOptions = createMutationOptions<T, TVariables>(options);

    offlineMutationOptions.context.conflictBase = getBaseStateFromCache(
      this.cache as unknown as ApolloCacheWithData,
      this.config.conflictProvider,
      offlineMutationOptions as unknown as MutationOptions
    );

    if (!offlineMutationOptions.update && this.config.mutationCacheUpdates) {
      offlineMutationOptions.update = this.config.mutationCacheUpdates[offlineMutationOptions.context.operationName];
    }
    return offlineMutationOptions;
  }

  protected decorateApolloClient(apolloClient: any): ApolloOfflineClient {
    apolloClient.offlineStore = this.offlineStore;
    apolloClient.registerOfflineEventListener = this.registerOfflineEventListener.bind(this);
    apolloClient.offlineMutate = this.offlineMutate.bind(this);
    apolloClient.queue = this.offix.queue;
    return apolloClient;
  }
}
