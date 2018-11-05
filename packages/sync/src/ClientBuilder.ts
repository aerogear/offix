import { InMemoryCache } from "apollo-cache-inmemory";
import { persistCache } from "apollo-cache-persist";
import { ApolloClient } from "apollo-client";
import { HttpLink } from "apollo-link-http";
import { DataSyncClientOptions, DefaultDataSyncClientOptions } from "./DataSyncClientOptions";
import { PersistedData, PersistentStore } from "./PersistentStore";

// TODO USE CORE to fetch URL
const uri = `http://localhost:4000/graphql`;

export const clientFactory = async (options?: DataSyncClientOptions) => {
  const clientOptions = new DefaultDataSyncClientOptions().merge(options);
  const httpLink = new HttpLink({ uri });
  const storage = clientOptions.storage as PersistentStore<PersistedData>;
  const cache = new InMemoryCache();
  const apolloClient = new ApolloClient({ link: httpLink, cache });

  await persistCache({
    cache,
    storage
  });
  return apolloClient;
};
