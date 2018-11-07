import { InMemoryCache } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { IDataSyncConfig } from "./config/DataSyncClientConfig";
import { SyncConfig } from "./config/DefaultConfig";
import { PersistedData, PersistentStore } from "./PersistentStore";

/**
 * Factory for creating Apollo Client
 *
 * @param options options object used to build client
 */
export const createClient = async (userConfig?: IDataSyncConfig) => {
  const config = new SyncConfig();
  const clientConfig = config.merge(userConfig);
  config.applyPlatformConfig(clientConfig);
  config.validate(config);
  const cache = new InMemoryCache({ dataIdFromObject: clientConfig.dataIdFromObject });

  const httpLink = new HttpLink({ uri: clientConfig.httpUrl });
  const storage = clientConfig.storage as PersistentStore<PersistedData>;
  const apolloClient = new ApolloClient({ link: httpLink, cache });

  await persistCache({
    cache,
    storage
  });
  return apolloClient;
};
