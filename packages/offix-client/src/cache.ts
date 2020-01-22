import { IDBLocalStore } from "offix-scheduler";

export const createDefaultCacheStorage = () => {
  return new IDBLocalStore("apollo-cache", "cache-store");
};
