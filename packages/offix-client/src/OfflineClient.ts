import { ApolloClient, OperationVariables, MutationOptions } from "apollo-client";
import { OffixClientConfig } from "./config/OffixClientConfig";
import { OffixDefaultConfig } from "./config/OffixDefaultConfig";
import { ApolloOperationSerializer } from "./apollo/ApolloOperationSerializer";
import { createCompositeLink } from "./apollo/LinksBuilder";
import { ApolloOfflineClient } from "./apollo/ApolloOfflineClient";
import {
  addOptimisticResponse,
  removeOptimisticResponse,
  restoreOptimisticResponse
} from "./apollo/optimisticResponseHelpers";
import {
  ApolloCacheWithData,
  OfflineStore,
  OfflineQueue,
  OfflineQueueListener,
  IDProcessor,
  IResultProcessor,
  OfflineError,
  getBaseStateFromCache,
  WebNetworkStatus,
  NetworkStatus,
  ConflictLink,
  ObjectState,
  NetworkInfo,
  QueueEntryOperation
} from "offix-offline";
import { FetchResult } from "apollo-link";
import { MutationHelperOptions, createMutationOptions, CacheUpdates } from "offix-cache";
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
export const createClient = async (userConfig: OffixClientConfig):
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
  public config: OffixDefaultConfig;
  // the network status interface that determines online/offline state
  public networkStatus: NetworkStatus;
  // the offline storage interface that persists offline data across restarts
  public offlineStore?: OfflineStore<MutationOptions>;
  // the in memory queue that holds offline data
  public queue: OfflineQueue<MutationOptions>;
  // listeners that can be added by the user to handle various events coming from the offline queue
  public queueListeners: Array<OfflineQueueListener<MutationOptions>> = [];
  // The apollo cache that holds application state
  public cache: InMemoryCache;
  // wrapper around the apollo cache for persisting it across restarts
  public persistor?: CachePersistor<object>;
  // The apollo client!
  public apolloClient?: ApolloOfflineClient;

  // determines whether we're offline or not
  private online: boolean = false;

  constructor(userConfig: OffixClientConfig) {
    this.config = new OffixDefaultConfig(userConfig);
    this.networkStatus = this.config.networkStatus || new WebNetworkStatus();

    // its possible that no storage is available
    if (this.config.offlineStorage) {
      this.offlineStore = new OfflineStore(this.config.offlineStorage, ApolloOperationSerializer);
    }

    const resultProcessors: Array<IResultProcessor<MutationOptions>> = [new IDProcessor()];

    this.queue = new OfflineQueue<MutationHelperOptions>(this.offlineStore, {
      listeners: this.buildEventListeners(),
      networkStatus: this.networkStatus,
      resultProcessors,
      execute: this.executeOfflineItem.bind(this)
    });

    this.cache = new InMemoryCache();

    if (this.config.cacheStorage) {
      this.persistor = new CachePersistor({
        cache: this.cache,
        serialize: false,
        storage: this.config.cacheStorage,
        maxSize: false,
        debug: false
      });
    }
  }

  /**
  * Initialize client
  */
  public async init(): Promise<ApolloOfflineClient> {
    if (this.offlineStore) {
      await this.offlineStore.init();
    }
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
    // TODO move this somewhere that makes sense, also handle error cases
    this.queue.registerOfflineQueueListener({
      onOperationEnqueued: (operation: QueueEntryOperation<MutationOptions>) => {
        if (this.apolloClient) {
          addOptimisticResponse(this.apolloClient, operation);
        }
      },
      onOperationSuccess: (operation: QueueEntryOperation<MutationOptions>) => {
        if (this.apolloClient) {
          removeOptimisticResponse(this.apolloClient, operation);
        }
      },
      onOperationFailure: (operation: QueueEntryOperation<MutationOptions>, error) => {
        if (this.apolloClient) {
          removeOptimisticResponse(this.apolloClient, operation);
        }
      },
      onOperationRequeued: (operation: QueueEntryOperation<MutationOptions>) => {
        if (this.config.mutationCacheUpdates && this.apolloClient) {
          restoreOptimisticResponse(this.apolloClient, this.config.mutationCacheUpdates, operation);
        }
      }
    });

    await this.restoreOfflineOperations();
    return this.apolloClient;
  }

  /**
   * Add new listener for listening for queue changes
   *
   * @param listener
   */
  public registerOfflineEventListener(listener: OfflineQueueListener<MutationOptions>) {
    this.queue.registerOfflineQueueListener(listener);
  }

  /**
   * Offline wrapper for apollo mutations. Provide Mutation Helper Options and use
   * this offline friendly function to handle the optimistic UI and cache updates.
   *
   * @param options the MutationHelperOptions to create the mutation
   */
  public async offlineMutation<T = any, TVariables = OperationVariables>(
    options: MutationHelperOptions<T, TVariables>): Promise<FetchResult<T>> {
    if (!this.apolloClient) {
      throw new Error("Apollo offline client not initialised before mutation called.");
    } else {

      const mutationOptions = this.createOfflineMutationOptions(options);

      if (this.online) {
        return this.apolloClient.mutate(mutationOptions);
      } else {
        // Queue the operation
        const queueEntry = await this.queue.enqueueOperation(mutationOptions as unknown as MutationOptions);

        // build a promise that will resolve/reject when the operation has been fulfilled
        const mutationPromise = this.queue.buildPromiseForEntry(queueEntry);

        // throw an error with a reference to the promise
        throw new OfflineError(mutationPromise as any);
      }
    }
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
    apolloClient.offlineMutation = this.offlineMutation.bind(this);
    apolloClient.queue = this.queue;
    return apolloClient;
  }

  /**
   * Restore offline operations into the queue
   */
  protected async restoreOfflineOperations() {

    // Reschedule offline mutations for new client instance
    // this.offlineMutationHandler && await this.offlineMutationHandler.replayOfflineMutations();
    await this.queue.restoreOfflineOperations();
    // After pushing all online changes check and set network status
    await this.initOnlineState();
  }

  protected buildEventListeners(): Array<OfflineQueueListener<MutationOptions>> {
    const listeners: Array<OfflineQueueListener<MutationOptions>> = [];

    // Check if user provided legacy listener
    // To provide backwards compatibility we ignore this case
    if (this.config.offlineQueueListener) {
      console.warn(
        "config.offlineQueueListener is deprecated and will " +
        "be removed in the next release. please use registerOfflineEventListener.");
      listeners.push(this.config.offlineQueueListener);
    }

    return listeners;
  }

  protected async initOnlineState() {
    const queue = this.queue;
    const self = this;
    this.online = !(await this.networkStatus.isOffline());
    if (this.online) {
      queue.forwardOperations();
    }
    this.networkStatus.onStatusChangeListener({
      onStatusChange(networkInfo: NetworkInfo) {
        self.online = networkInfo.online;
        if (self.online) {
          queue.forwardOperations();
        }
      }
    });
  }

  private async executeOfflineItem({ op, qid }: QueueEntryOperation<MutationOptions>) {
    if (this.apolloClient) {
      return await this.apolloClient.mutate(op);
    }
  }
}
