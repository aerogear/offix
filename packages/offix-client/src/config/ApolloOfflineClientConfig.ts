import {
  PersistedData,
  PersistentStore,
  createDefaultOfflineStorage
} from "offix-scheduler";
import { ApolloOfflineClientOptions } from "./ApolloOfflineClientoptions";
import { NetworkStatus } from "offix-offline";
import {
  ConflictResolutionStrategy,
  ConflictListener,
  UseClient,
  VersionedState } from "offix-conflicts-client";
import { createDefaultCacheStorage } from "../cache";
import { ApolloLink } from "apollo-link";
import { CacheUpdates } from "offix-cache";
import { ApolloOfflineQueueListener, createDefaultLink } from "../apollo";
import { InMemoryCache, NormalizedCacheObject } from "apollo-cache-inmemory";
import ApolloClient from "apollo-client";

/**
 * Class for managing user and default configuration.
 * Default config is applied on top of user provided configuration
 */
export class ApolloOfflineClientConfig implements ApolloOfflineClientOptions {
  public httpUrl?: string;
  public offlineQueueListener?: ApolloOfflineQueueListener;
  public conflictStrategy: ConflictResolutionStrategy;
  public conflictProvider = new VersionedState();
  public networkStatus?: NetworkStatus;
  public terminatingLink: ApolloLink | undefined;
  public cacheStorage: PersistentStore<PersistedData>;
  public offlineStorage: PersistentStore<PersistedData>;
  public conflictListener?: ConflictListener;
  public mutationCacheUpdates?: CacheUpdates;
  public createApolloClient?: () => ApolloClient<NormalizedCacheObject>;
  public link?: ApolloLink;
  public cache: any;

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

  constructor(options = {} as ApolloOfflineClientOptions) {
    Object.assign(this, options);

    if (options.storage) {
      this.cacheStorage = options.storage;
      this.offlineStorage = options.storage;
    } else {
      this.cacheStorage = createDefaultCacheStorage();
      this.offlineStorage = createDefaultOfflineStorage();
    }
    this.conflictStrategy = options.conflictStrategy || UseClient;
    this.link = options.link || createDefaultLink(this);
  }
}
