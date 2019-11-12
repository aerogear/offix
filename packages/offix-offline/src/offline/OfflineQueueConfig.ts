import { NetworkStatus, OfflineQueueListener, PersistentStore, PersistedData } from "../index";
import { CacheUpdates } from "offix-cache";
import { ExecuteFunction } from "./ExecuteFunction";

/**
 * Conguration required for OfflineQueue
 */
export interface OfflineQueueConfig<T> {
  networkStatus: NetworkStatus;
  listeners?: Array<OfflineQueueListener<T>>;
  mutationCacheUpdates?: CacheUpdates;
  offlineStorage?: PersistentStore<PersistedData>;
  execute: ExecuteFunction<T>;
}
