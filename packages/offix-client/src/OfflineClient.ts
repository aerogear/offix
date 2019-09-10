import { ApolloClient, OperationVariables, NetworkStatus, MutationOptions } from "apollo-client";
import { OffixClientConfig } from "./config/OffixClientConfig";
import { OffixDefaultConfig } from "./config/OffixDefaultConfig";
import { createCompositeLink, createOfflineLink, createConflictLink } from "./LinksBuilder";
import { createOperation } from "apollo-link";
import {
  OfflineStore,
  OfflineQueueListener,
  OfflineLink,
  OfflineMutationsHandler,
  CompositeQueueListener,
  ListenerProvider,
  OfflineProcessor,
  IDProcessor,
  IResultProcessor,
  OfflineError,
  BaseProcessor
} from "offix-offline";
import { FetchResult, ApolloLink } from "apollo-link";
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

  public queueListeners: OfflineQueueListener[] = [];
  public apolloClient?: ApolloOfflineClient;
  public store: OfflineStore;
  public config: OffixDefaultConfig;
  public offlineProcessor?: OfflineProcessor;
  public baseProcessor?: BaseProcessor;
  public cache: InMemoryCache;
  public persistor: CachePersistor<object>;

  constructor(userConfig: OffixClientConfig) {
    this.config = new OffixDefaultConfig(userConfig);
    this.store = new OfflineStore(this.config.offlineStorage);
    this.setupEventListeners();
    this.cache = new InMemoryCache();
    this.persistor = new CachePersistor({
      cache: this.cache,
      serialize: false,
      storage: this.config.cacheStorage,
      maxSize: false,
      debug: false
    });
  }

  /**
  * Initialize client
  */
  public async init(): Promise<ApolloOfflineClient> {
    await this.store.init();
    await this.persistor.restore();
    const offlineLink = await createOfflineLink(this.config, this.store);
    const conflictLink = await createConflictLink(this.config);
    const resultProcessors: IResultProcessor[] = [
      new IDProcessor()
    ];
    this.offlineProcessor = new OfflineProcessor(this.store, {
      listener: this.config.offlineQueueListener,
      networkStatus: this.config.networkStatus,
      resultProcessors
    });
    const link = await createCompositeLink(this.config, offlineLink, conflictLink);
    const client = new ApolloClient({
      link,
      cache: this.cache
    }) as any;
    this.apolloClient = this.decorateApolloClient(client);
    this.baseProcessor = new BaseProcessor({
      stater: this.config.conflictProvider,
      cache: this.apolloClient.cache
    });
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
      this.baseProcessor.getBaseState(mutationOptions as unknown as  MutationOptions);

      if (this.offlineProcessor) {
        if (this.offlineProcessor.online) {
          return this.apolloClient.mutate(mutationOptions);
        } else {
          await this.offlineProcessor.queue.persistItemWithQueue(operation);
          const mutationPromise = this.apolloClient.mutate<T, TVariables>(
            mutationOptions
          );
          throw new OfflineError(mutationPromise);
        }
      }
      throw new Error("Offix Client not initialized properly");
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
    // TODO This is a total mess - needs refactoring
    const offlineMutationHandler = new OfflineMutationsHandler(this.store,
      this.apolloClient as ApolloOfflineClient,
      this.config);
    offlineLink.setup(offlineMutationHandler);
    // Reschedule offline mutations for new client instance
    await offlineMutationHandler.replayOfflineMutations();

    // After pushing all online changes check and set network status

    // ^^ But why do we wait until now to check and set network status?
    await offlineLink.initOnlineState(); // TODO this needs to go away

    if (this.offlineProcessor) {
      await  this.offlineProcessor.initOnlineState();
    }
  }

  protected setupEventListeners() {
    // Check if user provided legacy listener
    // To provide backwards compatibility we ignore this case
    if (!this.config.offlineQueueListener) {
      this.config.offlineQueueListener = new CompositeQueueListener(this);
    }
  }

}
