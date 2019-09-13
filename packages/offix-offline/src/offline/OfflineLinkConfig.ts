import { NetworkStatus, OfflineQueueListener, IResultProcessor, PersistentStore, PersistedData } from "../index";
import { CacheUpdates } from "offix-cache";

/**
 * Conguration required for OfflineQueue
 */
export interface OfflineQueueConfig {
    networkStatus: NetworkStatus;
    listeners?: OfflineQueueListener[];
    resultProcessors?: IResultProcessor[];
    mutationCacheUpdates?: CacheUpdates;
    offlineStorage?: PersistentStore<PersistedData>;
    execute: Function
  }
