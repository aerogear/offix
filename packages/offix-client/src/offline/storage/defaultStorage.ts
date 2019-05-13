import { Store } from "idb-localstorage";
import { persistCache } from "@graphqlheroes/apollo-cache-persist";
import { InMemoryCache } from "apollo-cache-inmemory";
import { PersistedData, PersistentStore } from "./PersistentStore";

export const createDefaultCacheStorage = () => {
  return new Store("apollo-cache", "cache-store");
};

export const createDefaultOfflineStorage = () => {
  return new Store("offline-store", "offline-data");
};

/**
 * Build storage that will be used for caching data
 */
export const buildCachePersistence = async (store: PersistentStore<PersistedData>) => {
  const cache = new InMemoryCache();
  await persistCache({
    cache,
    serialize: false,
    storage: store,
    maxSize: false,
    debug: false
  });
  return cache;
};
