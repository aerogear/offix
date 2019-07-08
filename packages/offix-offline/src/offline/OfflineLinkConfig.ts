import { NetworkStatus, OfflineQueueListener, IResultProcessor, PersistentStore, PersistedData } from "../index";
import { CacheUpdates } from "offix-cache";

/**
 * Conguration required for OfflineLink
 */
export interface OfflineLinkConfig {
    networkStatus?: NetworkStatus;
    listener?: OfflineQueueListener;
    resultProcessors?: IResultProcessor[];
    mutationCacheUpdates?: CacheUpdates;
    offlineStorage?: PersistentStore<PersistedData>;
  };