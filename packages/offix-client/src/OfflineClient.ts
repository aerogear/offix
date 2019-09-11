import { ApolloClient, OperationVariables, MutationOptions } from "apollo-client";
import { OffixClientConfig } from "./config/OffixClientConfig";
import { OffixDefaultConfig } from "./config/OffixDefaultConfig";
import { createCompositeLink } from "./LinksBuilder";
import { createOperation } from "apollo-link";
import {
  OfflineStore,
  OfflineQueue,
  OfflineQueueListener,
  OfflineLink,
  OfflineMutationsHandler,
  CompositeQueueListener,
  ListenerProvider,
  IDProcessor,
  IResultProcessor,
  OfflineError,
  BaseProcessor,
  WebNetworkStatus,
  NetworkStatus,
  ConflictLink,
  ObjectState,
  NetworkInfo
} from "offix-offline";
import { FetchResult } from "apollo-link";
import { ApolloOfflineClient } from "./ApolloOfflineClient";
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
export class OfflineClient implements ListenerProvider {
  // the offix client global config
  public config: OffixDefaultConfig;
  // the network status interface that determines online/offline state
  public networkStatus: NetworkStatus;
  // the offline storage interface that persists offline data across restarts
  public store: OfflineStore;
  // the in memory queue that holds offline data
  public queue: OfflineQueue;
  // listeners that can be added by the user to handle various events coming from the offline queue
  public queueListeners: OfflineQueueListener[] = [];
  // The apollo cache that holds application state
  public cache: InMemoryCache;
  // wrapper around the apollo cache for persisting it across restarts
  public persistor: CachePersistor<object>;
  // captures the 'base' object a mutation is performed on. Used for conflict resolution
  public baseProcessor: BaseProcessor;
  // The apollo client!
  public apolloClient?: ApolloOfflineClient;
  // determines whether we're offline or not
  private online: boolean = false;

  constructor(userConfig: OffixClientConfig) {
    this.config = new OffixDefaultConfig(userConfig);
    this.networkStatus = this.config.networkStatus || new WebNetworkStatus();
    this.store = new OfflineStore(this.config.offlineStorage);
    const resultProcessors: IResultProcessor[] = [new IDProcessor()];
    this.queue = new OfflineQueue(this.store, {
      listener: this.config.offlineQueueListener,
      networkStatus: this.config.networkStatus,
      resultProcessors
    });
    this.setupEventListeners();
    this.cache = new InMemoryCache();
    this.persistor = new CachePersistor({
      cache: this.cache,
      serialize: false,
      storage: this.config.cacheStorage,
      maxSize: false,
      debug: false
    });
    this.baseProcessor = new BaseProcessor({
      stater: this.config.conflictProvider,
      cache: this.cache
    });
  }

  /**
  * Initialize client
  */
  public async init(): Promise<ApolloOfflineClient> {
    await this.store.init();
    await this.persistor.restore();

    const offlineLink = new OfflineLink(this.queue, this.networkStatus);

    const conflictLink = new ConflictLink({
      conflictProvider: this.config.conflictProvider as ObjectState,
      conflictListener: this.config.conflictListener,
      conflictStrategy: this.config.conflictStrategy
    });

    const link = await createCompositeLink(this.config, offlineLink, conflictLink);

    const client = new ApolloClient({
      link,
      cache: this.cache
    });

    this.apolloClient = this.decorateApolloClient(client);
    await this.restoreOfflineOperations(offlineLink);
    return this.apolloClient;
  }

  /**
   * Get access to offline store that can be used to
   * visualize  offline  operations that are currently pending
   */
  public get offlineStore(): OfflineStore {
    return this.store;
  }

  /**
   * Add new listener for listening for queue changes
   *
   * @param listener
   */
  public registerOfflineEventListener(listener: OfflineQueueListener) {
    this.queueListeners.push(listener);
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
      const mutationOptions = createMutationOptions<T, TVariables>(options);
      mutationOptions.context.cache = this.apolloClient.cache;

      // TODO This needs to be refactored
      // Storage should not rely on operation
      // Base Processor relies on operation because it uses getObjectFromCache
      // getObjectFromCache gets the cache instance from operation
      const operation = createOperation(mutationOptions.context, {
        query: mutationOptions.mutation,
        variables: mutationOptions.variables
      });

      mutationOptions.context.conflictBase = this.baseProcessor &&
        this.baseProcessor.getBaseState(mutationOptions as unknown as MutationOptions);

      if (this.online) {
        return this.apolloClient.mutate(mutationOptions);
      } else {
        await this.queue.persistItemWithQueue(operation);
        const mutationPromise = this.apolloClient.mutate<T, TVariables>(
          mutationOptions
        );
        throw new OfflineError(mutationPromise);
      }
    }
  }

  protected decorateApolloClient(apolloClient: any): ApolloOfflineClient {
    apolloClient.offlineStore = this.offlineStore;
    apolloClient.registerOfflineEventListener = this.registerOfflineEventListener.bind(this);
    apolloClient.offlineMutation = this.offlineMutation.bind(this);
    return apolloClient;
  }

  /**
   * Restore offline operations into the queue
   */
  protected async restoreOfflineOperations(offlineLink: OfflineLink) {

    const offlineMutationHandler = new OfflineMutationsHandler(this.store,
      this.apolloClient as ApolloOfflineClient,
      this.config.mutationCacheUpdates);

    // Reschedule offline mutations for new client instance
    await offlineMutationHandler.replayOfflineMutations();

    // After pushing all online changes check and set network status
    await this.initOnlineState();
    await offlineLink.initOnlineState(); // TODO this needs to go away
  }

  protected setupEventListeners() {
    // Check if user provided legacy listener
    // To provide backwards compatibility we ignore this case
    if (!this.config.offlineQueueListener) {
      this.config.offlineQueueListener = new CompositeQueueListener(this);
    }
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
}
