import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import { ApolloClient } from "apollo-client";
import { DataSyncConfig } from "./config";
import { SyncConfig } from "./config/SyncConfig";
import { defaultLink } from "./links/LinksBuilder";
import { PersistedData, PersistentStore } from "./PersistentStore";
import { OfflineRestoreHandler } from "./offline/OfflineRestoreHandler";

/**
 * @see ApolloClient
 */
export type VoyagerClient = ApolloClient<NormalizedCacheObject>;

/**
 * Factory for creating Apollo Client
 *
 * @param userConfig options object used to build client
 */
export const createClient = async (userConfig?: DataSyncConfig): Promise<VoyagerClient> => {
  const clientConfig = extractConfig(userConfig);
  const { cache } = await buildCachePersistence(clientConfig);

  const link = await defaultLink(clientConfig);

  const apolloClient = new ApolloClient({
    link,
    cache
  });

  const offlineMutationHandler = new OfflineRestoreHandler(apolloClient,
    clientConfig);
  // Reschedule offline mutations for new client instance
  await offlineMutationHandler.replayOfflineMutations();
  return apolloClient;
};

/**
 * Extract configuration from user and external sources
 */
function extractConfig(userConfig: DataSyncConfig | undefined) {
  const config = new SyncConfig(userConfig);
  const clientConfig = config.getClientConfig();
  return clientConfig;
}

/**
 * Build storage that will be used for caching data
 *
 * @param clientConfig
 */
async function buildCachePersistence(clientConfig: DataSyncConfig) {
  const cache = new InMemoryCache();
  await persistCache({
    cache,
    storage: clientConfig.storage as PersistentStore<PersistedData>,
    maxSize: false,
    debug: false
  });
  return { cache };
}
