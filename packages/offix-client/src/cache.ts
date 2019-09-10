import { Store } from "idb-localstorage";
import { persistCache } from "apollo-cache-persist";
import { InMemoryCache } from "apollo-cache-inmemory";
import { PersistedData, PersistentStore } from "offix-offline";

export const createDefaultCacheStorage = () => {
  return new Store("apollo-cache", "cache-store");
};
