import { NetworkStatus } from "offix-offline";
import { OfflineQueueListener } from "./OfflineQueueListener";
import { QueueExecuteFunction } from "./QueueExecuteFunction";
import { PersistentStore, PersistedData } from "../store";

/**
 * Conguration required for OfflineQueue
 */
export interface OfflineQueueConfig<T> {
  networkStatus: NetworkStatus;
  listeners?: Array<OfflineQueueListener<T>>;
  offlineStorage?: PersistentStore<PersistedData>;
  execute: QueueExecuteFunction<T>;
}
