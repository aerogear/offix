import { NetworkStatus } from "offix-offline";
import { CacheUpdates } from "offix-cache";
import { OfflineQueueListener } from "./OfflineQueueListener";
import { QueueExecuteFunction } from "./QueueExecuteFunction";
import { PersistentStore, PersistedData } from "../store";

/**
 * Conguration required for OfflineQueue
 */
export interface OfflineQueueConfig<T> {
  networkStatus: NetworkStatus;
  listeners?: Array<OfflineQueueListener<T>>;
  mutationCacheUpdates?: CacheUpdates;
  offlineStorage?: PersistentStore<PersistedData>;
  execute: QueueExecuteFunction<T>;
}
