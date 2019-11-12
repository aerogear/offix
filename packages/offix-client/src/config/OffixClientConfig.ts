import {
  PersistedData,
  PersistentStore,
  createDefaultOfflineStorage
} from "offix-scheduler";
import { OffixClientOptions } from "./OffixClientOptions";
import { NetworkStatus } from "offix-offline";
import {
  ConflictResolutionStrategy,
  ConflictListener,
  UseClient,
  VersionedState } from "offix-conflicts-client";
import { createDefaultCacheStorage } from "../cache";
import { ApolloLink } from "apollo-link";
import { CacheUpdates } from "offix-cache";
import { ApolloOfflineQueueListener } from "../apollo";
import { InMemoryCache } from "apollo-cache-inmemory";

/**
 * Class for managing user and default configuration.
 * Default config is applied on top of user provided configuration
 */
export class OffixClientConfig implements OffixClientOptions {
  public httpUrl?: string;
  public offlineQueueListener?: ApolloOfflineQueueListener;
  public conflictStrategy: ConflictResolutionStrategy;
  public conflictProvider = new VersionedState();
  public networkStatus?: NetworkStatus;
  public terminatingLink: ApolloLink | undefined;
  public cacheStorage?: PersistentStore<PersistedData>;
  public offlineStorage?: PersistentStore<PersistedData>;
  public conflictListener?: ConflictListener;
  public mutationCacheUpdates?: CacheUpdates;
  public cache?: InMemoryCache;

  public retryOptions = {
    delay: {
      initial: 1000,
      max: Infinity,
      jitter: true
    },
    attempts: {
      max: 5
    }
  };

  constructor(clientOptions: OffixClientOptions) {
    if (clientOptions && clientOptions.storage) {
      this.cacheStorage = clientOptions.storage;
      this.offlineStorage = clientOptions.storage;
    } else {
      this.cacheStorage = createDefaultCacheStorage();
      this.offlineStorage = createDefaultOfflineStorage();
    }

    this.conflictStrategy = clientOptions.conflictStrategy || UseClient;
    Object.assign(this, clientOptions);
  }
}
