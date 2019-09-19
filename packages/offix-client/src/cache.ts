import { Store } from "idb-localstorage";

export const createDefaultCacheStorage = () => {
  try {
    return new Store("apollo-cache", "cache-store");
  } catch(error) {
    console.error('Failed to create storage', error)
  }
};
