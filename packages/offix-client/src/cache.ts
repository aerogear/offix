import { Store } from "idb-localstorage";

export const createDefaultCacheStorage = () => {
  return new Store("apollo-cache", "cache-store");
};
