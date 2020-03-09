import {
  PersistedData,
  PersistentStore,
  createDefaultOfflineStorage
} from "offix-scheduler";
import { ApolloOfflineClientOptions, InputMapper } from "./ApolloOfflineClientOptions";
import { NetworkStatus } from "offix-offline";
import {
  ConflictResolutionStrategy,
  UseClient,
  VersionedState,
  ObjectState
} from "offix-conflicts-client";
import { createDefaultCacheStorage } from "../cache";
import { ApolloLink } from "apollo-link";
import { CacheUpdates } from "offix-cache";
import { ApolloOfflineQueueListener, createDefaultLink, CompositeConflictListener } from "../apollo";
import { CachePersistor } from "apollo-cache-persist";

/**
 * Class for managing user and default configuration.
 * Default config is applied on top of user provided configuration
 */
export class ApolloOfflineClientConfig implements ApolloOfflineClientOptions {
  public httpUrl?: string;
  public offlineQueueListener?: ApolloOfflineQueueListener;
  public conflictStrategy: ConflictResolutionStrategy;
  public conflictProvider: ObjectState;
  public networkStatus?: NetworkStatus;
  public terminatingLink: ApolloLink | undefined;
  public cacheStorage: PersistentStore<PersistedData>;
  public offlineStorage: PersistentStore<PersistedData>;
  public conflictListener: CompositeConflictListener;
  public mutationCacheUpdates?: CacheUpdates;
  public cachePersistor?: CachePersistor<object>;
  public link?: ApolloLink;
  public inputMapper?: InputMapper;
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

    this.cacheStorage = options.cacheStorage || createDefaultCacheStorage();
    this.offlineStorage = options.offlineStorage || createDefaultOfflineStorage();
    this.conflictStrategy = options.conflictStrategy || UseClient;
    this.conflictProvider = options.conflictProvider || new VersionedState();
    this.conflictListener = new CompositeConflictListener();
    if (options.conflictListener) {
      this.conflictListener.addConflictListener(options.conflictListener);
    }
    this.link = createDefaultLink(this);
  }
}
