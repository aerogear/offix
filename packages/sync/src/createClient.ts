import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import { ApolloClient } from "apollo-client";
import { DataSyncConfig } from "./config";
import { SyncConfig } from "./config/SyncConfig";
import { defaultLinkBuilder as buildLink } from "./links/LinksBuilder";
import { PersistedData, PersistentStore } from "./PersistentStore";
import { OfflineRestoreHandler } from "./offline/OfflineRestoreHandler";

/**
 * Factory for creating Apollo Client
 *
 * @param userConfig options object used to build client
 */
export const createClient = async (userConfig?: DataSyncConfig) => {
  const clientConfig = extractConfig(userConfig);
  const { cache } = await buildCachePersistence(clientConfig);
  const link = buildLink(clientConfig);
  const apolloClient = new ApolloClient<NormalizedCacheObject>({
    link,
    cache
  });
  const storage = clientConfig.storage as PersistentStore<PersistedData>;
  const offlineMutationHandler = new OfflineRestoreHandler(apolloClient,
    storage,
    clientConfig.mutationsQueueName);
  offlineMutationHandler.replayOfflineMutations();
  return apolloClient;
};

/**
 * Extract configuration from user and external sources
 */
function extractConfig(userConfig: DataSyncConfig | undefined) {
  const config = new SyncConfig();
  const clientConfig = config.merge(userConfig);
  config.applyPlatformConfig(clientConfig);
  config.validate(config);
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
    storage: clientConfig.storage as PersistentStore<PersistedData>
  });
  return { cache };
}
