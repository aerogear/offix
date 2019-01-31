import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import { ApolloClient } from "apollo-client";
import { DataSyncConfig } from "./config";
import { SyncConfig } from "./config/SyncConfig";
import { defaultHttpLinks } from "./links/LinksBuilder";
import { PersistedData, PersistentStore } from "./PersistentStore";
import { OfflineRestoreHandler } from "./offline/OfflineRestoreHandler";
import { defaultWebSocketLink } from "./links/WebsocketLink";
import { ApolloLink } from "apollo-link";
import { isSubscription } from "./utils/helpers";
import { OfflineQueueLink } from "./links/OfflineQueueLink";

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

  const httpLinks = await defaultHttpLinks(clientConfig);
  let link = ApolloLink.from(httpLinks);
  if (clientConfig.wsUrl) {
    const wsLink = defaultWebSocketLink({ uri: clientConfig.wsUrl });
    link = ApolloLink.split(isSubscription, wsLink, link);
  }

  const apolloClient = new ApolloClient({
    link,
    cache
  });

  const offlineQueueLink = httpLinks.find(l => l instanceof OfflineQueueLink) as OfflineQueueLink;
  const storage = clientConfig.storage as PersistentStore<PersistedData>;
  const offlineMutationHandler = new OfflineRestoreHandler(apolloClient,
    storage,
    clientConfig.mutationsQueueName,
    offlineQueueLink);
  await offlineMutationHandler.replayOfflineMutations();
  offlineQueueLink.openQueueOnNetworkStateUpdates();

  return apolloClient;
};

/**
 * Extract configuration from user and external sources
 */
function extractConfig(userConfig: DataSyncConfig | undefined) {
  const config = new SyncConfig();
  config.applyPlatformConfig(config);
  const clientConfig = config.merge(userConfig);
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
