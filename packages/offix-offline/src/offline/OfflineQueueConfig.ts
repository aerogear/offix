import { NetworkStatus, OfflineQueueListener, IResultProcessor, PersistentStore, PersistedData } from "../index";
import { CacheUpdates } from "offix-cache";

/**
 * Conguration required for OfflineQueue
 */
export interface OfflineQueueConfig<T> {
  networkStatus: NetworkStatus;
  listeners?: OfflineQueueListener<T>[];
  resultProcessors?: IResultProcessor<T>[];
  mutationCacheUpdates?: CacheUpdates;
  offlineStorage?: PersistentStore<PersistedData>;
  execute: Function;
}
