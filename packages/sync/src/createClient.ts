import { InMemoryCache } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import { ApolloClient } from "apollo-client";
import { IDataSyncConfig } from "./config/DataSyncClientConfig";
import { SyncConfig } from "./config/DefaultConfig";
import { defaultLinkBuilder as buildLink} from "./links/LinksBuilder";
import { PersistedData, PersistentStore } from "./PersistentStore";

/**
 * Factory for creating Apollo Client
 *
 * @param options options object used to build client
 */
export const createClient = async (userConfig?: IDataSyncConfig) => {

  const clientConfig = extractConfig(userConfig);
  const cache = await buildStorage(clientConfig);
  const link = buildLink(clientConfig);

  return new ApolloClient({ link , cache });
};

/**
 * Extract configuration from user and external sources
 */
function extractConfig(userConfig: IDataSyncConfig | undefined) {
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
async function buildStorage(clientConfig: IDataSyncConfig) {
  const cache = new InMemoryCache({
    dataIdFromObject: () =>  clientConfig.dataIdFromObject
  });
  const storage = clientConfig.storage as PersistentStore<PersistedData>;
  await persistCache({
    cache,
    storage
  });
  return cache;
}
