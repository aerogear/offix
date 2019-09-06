import { ApolloClient, OperationVariables } from "apollo-client";
import { OffixClientConfig } from "./config/OffixClientConfig";
import { OffixDefaultConfig } from "./config/OffixDefaultConfig";
import { createCompositeLink, createOfflineLink, createConflictLink } from "./LinksBuilder";
import {
  OfflineStore,
  OfflineQueueListener,
  OfflineLink,
  OfflineMutationsHandler,
  CompositeQueueListener,
  ListenerProvider,
  PersistentStore,
  PersistedData
} from "offix-offline";
import { ApolloOfflineClient } from "./ApolloOfflineClient";
import { MutationHelperOptions, createMutationOptions } from "offix-cache";
import { FetchResult } from "apollo-link";
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
    const link = await createCompositeLink(this.config, offlineLink, conflictLink);
    const client = new ApolloClient({
      link,
      cache: this.cache
    }) as any;
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
  public offlineMutation<T = any, TVariables = OperationVariables>(
    options: MutationHelperOptions<T, TVariables>): Promise<FetchResult<T>> {
    if (!this.apolloClient) {
      throw new Error("Apollo offline client not initialised before mutation called.");
    } else {
      const mutationOptions = createMutationOptions<T, TVariables>(options);
      mutationOptions.context.updateFunction = mutationOptions.update;
      return this.apolloClient.mutate<T, TVariables>(
        mutationOptions
      );
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
      this.config);
    offlineLink.setup(offlineMutationHandler);
    // Reschedule offline mutations for new client instance
    await offlineMutationHandler.replayOfflineMutations();
    // After pushing all online changes check and set network status
    await offlineLink.initOnlineState();
  }

  protected setupEventListeners() {
    // Check if user provided legacy listener
    // To provide backwards compatibility we ignore this case
    if (!this.config.offlineQueueListener) {
      this.config.offlineQueueListener = new CompositeQueueListener(this);
    }
  }

}
