import { ApolloClient } from "apollo-client";
import { DataSyncConfig } from "./config";
import { SyncConfig } from "./config/SyncConfig";
import { createDefaultLink, createOfflineLink } from "./links/LinksBuilder";
import { OfflineStore, OfflineQueueListener } from "./offline";
import { OfflineLink } from "./offline/OfflineLink";
import { OfflineMutationsHandler } from "./offline/OfflineMutationsHandler";
import { CompositeQueueListener } from "./offline/events/CompositeQueueListener";
import { ListenerProvider } from "./offline/events/ListenerProvider";
import { ApolloOfflineClient } from "./OfflineApolloClient";
import { buildCachePersistence } from "./offline/storage/defaultStorage";

/**
* Factory for creating Apollo Offline Client
*
* @param userConfig options object used to build client
* @deprecated use OfflineClient class directly:
* ```javascript
*  const offlineClient = new OfflineClient(config);
*  await offlineClient.init();
*  ```
*/
export const createClient = async (userConfig: DataSyncConfig):
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
  private apolloClient?: ApolloOfflineClient;
  private store: OfflineStore;
  private config: SyncConfig;

  constructor(userConfig: DataSyncConfig) {
    this.config = new SyncConfig(userConfig);
    this.store = new OfflineStore(this.config);
    this.setupEventListeners();
  }

  /**
  * Initialize client
  */
  public async init(): Promise<ApolloOfflineClient> {
    await this.store.init();
    const cache = await buildCachePersistence(this.config.cacheStorage);
    const offlineLink = await createOfflineLink(this.config, this.store);
    const link = await createDefaultLink(this.config, offlineLink);

    const client = new ApolloClient({
      link,
      cache
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

  protected decorateApolloClient(apolloClient: any): ApolloOfflineClient {
    apolloClient.offlineStore = this.offlineStore;
    apolloClient.registerOfflineEventListener = this.registerOfflineEventListener.bind(this);
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

  private setupEventListeners() {
    // Check if user provided legacy listener
    // To provide backwards compatibility we ignore this case
    if (!this.config.offlineQueueListener) {
      this.config.offlineQueueListener = new CompositeQueueListener(this);
    }
  }
}
