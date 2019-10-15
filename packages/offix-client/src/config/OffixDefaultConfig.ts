import { isMobileCordova } from "../utils/platform";
import { PersistedData, PersistentStore, ConflictListener } from "offix-offline";
import { OffixClientConfig } from "./OffixClientConfig";
import { CordovaNetworkStatus, NetworkStatus, WebNetworkStatus } from "offix-offline";
import { UseClient } from "offix-offline";
import { VersionedState } from "offix-offline";
import { ConflictResolutionStrategy } from "offix-offline";
import { createDefaultOfflineStorage } from "offix-offline";
import { createDefaultCacheStorage } from "../cache";
import { ApolloLink } from "apollo-link";
import { CacheUpdates } from "offix-cache";
import { ApolloOfflineQueueListener } from "../apollo";
import { InMemoryCache } from "apollo-cache-inmemory";

/**
 * Class for managing user and default configuration.
 * Default config is applied on top of user provided configuration
 */
export class OffixDefaultConfig implements OffixClientConfig {
  public httpUrl?: string;
  public offlineQueueListener?: ApolloOfflineQueueListener;
  public conflictStrategy: ConflictResolutionStrategy;
  public conflictProvider = new VersionedState();
  public networkStatus: NetworkStatus;
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

  constructor(clientOptions?: OffixClientConfig) {
    if (clientOptions && clientOptions.storage) {
      this.cacheStorage = clientOptions.storage;
      this.offlineStorage = clientOptions.storage;
    } else {
      this.cacheStorage = createDefaultCacheStorage();
      this.offlineStorage = createDefaultOfflineStorage();
    }
    this.networkStatus = (isMobileCordova()) ?
      new CordovaNetworkStatus() : new WebNetworkStatus();

    if (clientOptions && clientOptions.conflictStrategy) {
      this.conflictStrategy = clientOptions.conflictStrategy;
    } else {
      this.conflictStrategy = UseClient;
    }
    Object.assign(this, clientOptions);
  }
}
