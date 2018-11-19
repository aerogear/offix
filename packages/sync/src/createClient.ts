import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import { ApolloClient, ApolloClientOptions } from "apollo-client";
import { DataSyncConfig } from "./config/DataSyncConfig";
import { SyncConfig } from "./config/SyncConfig";
import { defaultLinkBuilder as buildLink} from "./links/LinksBuilder";
import { PersistedData, PersistentStore } from "./PersistentStore";
import { SyncOfflineMutation } from "./offline/SyncOfflineMutation";
import { ApolloCache } from "apollo-cache";

/**
 * Factory for creating Apollo Client
 *
 * @param options options object used to build client
 */
export const createClient = async (userConfig?: DataSyncConfig) => {

  const clientConfig = extractConfig(userConfig);
  const { cache, storage } = await buildStorage(clientConfig);
  const link = buildLink(clientConfig, storage);
  const options: ApolloClientOptions<NormalizedCacheObject> = {
    link: link,
    cache: cache
  }
  const apolloClient = new ApolloClient<NormalizedCacheObject>(options);
  const syncOfflineMutations = new SyncOfflineMutation(apolloClient, storage, 'offline-mutation-store')
  syncOfflineMutations.sync();
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
async function buildStorage(clientConfig: DataSyncConfig) {
  const cache = new InMemoryCache({
    dataIdFromObject: () =>  clientConfig.dataIdFromObject
  });
  const storage = clientConfig.storage as PersistentStore<PersistedData>;
  await persistCache({
    cache,
    storage
  });
  return {cache, storage};
}
