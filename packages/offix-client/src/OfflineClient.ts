import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import { ApolloClient } from "apollo-client";
import { DataSyncConfig } from "./config";
import { SyncConfig } from "./config/SyncConfig";
import { createDefaultLink, createOfflineLink } from "./links/LinksBuilder";
import { OfflineStore } from "./offline";
import { OfflineLink } from "./offline/OfflineLink";
import { OfflineMutationsHandler } from "./offline/OfflineMutationsHandler";
import { PersistedData, PersistentStore } from "./PersistentStore";

/**
 * @see ApolloClient
 */
export interface ApolloOfflineClient extends ApolloClient<NormalizedCacheObject> {
  offlineStore: OfflineStore;
}

/**
* Factory for creating Apollo Client
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
 * storage for Apollo GraphQL client.
 *
 * Usage:
 *
 *  ```javascript
 *  const offlineClient = new OfflineClient(config);
 *  await offlineClient.init();
 *  ```
 */
export class OfflineClient {
  private apolloClient?: ApolloOfflineClient;
  private store: OfflineStore;
  private config: DataSyncConfig;

  constructor(userConfig: DataSyncConfig) {
    this.config = this.extractConfig(userConfig);
    this.store = new OfflineStore(this.config);
  }

  /**
   * Get access to offline store that can be used to
   * visualize  offline  operations that are currently pending
   */
  public get offlineStore(): OfflineStore {
    return this.store;
  }

  /**
  * Create new client
  *
  * @param userConfig options object used to build client
  */
  public async init(): Promise<ApolloOfflineClient> {
    const { cache } = await this.buildCachePersistence(this.config);
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

  protected decorateApolloClient(apolloClient: any): ApolloOfflineClient {
    apolloClient.offlineStore = this.offlineStore;
    return apolloClient;
  }

  /**
 * Extract configuration from user and external sources
 */
  protected extractConfig(userConfig: DataSyncConfig | undefined) {
    const config = new SyncConfig(userConfig);
    const clientConfig = config.getClientConfig();
    return clientConfig;
  }

  /**
   * Restore offline operations into the queue
   */
  protected async restoreOfflineOperations(offlineLink: OfflineLink) {

    const offlineMutationHandler = new OfflineMutationsHandler(
      this.apolloClient as ApolloOfflineClient,
      this.config);
    offlineLink.setup(offlineMutationHandler);
    // Reschedule offline mutations for new client instance
    await offlineMutationHandler.replayOfflineMutations();
    // After pushing all online changes check and set network status
    await offlineLink.initOnlineState();
  }

/**
 * Build storage that will be used for caching data
 *
 * @param clientConfig
 */
  protected async buildCachePersistence(clientConfig: DataSyncConfig) {
    const cache = new InMemoryCache();
    await persistCache({
      cache,
      storage: clientConfig.storage as PersistentStore<PersistedData>,
      maxSize: false,
      debug: false
    });
    return { cache };
  }

}
