import {
  PersistedData,
  PersistentStore,
  createDefaultOfflineStorage
} from "offix-scheduler";
import { ApolloOfflineClientOptions, InputMapper } from "./ApolloOfflineClientOptions";
import { NetworkStatus } from "offix-offline";
import { createDefaultCacheStorage } from "../cache";
import { ApolloLink } from "apollo-link";
import { CacheUpdates } from "offix-cache";
import { ApolloOfflineQueueListener, createDefaultLink } from "../apollo";
import { CachePersistor } from "apollo-cache-persist";

/**
 * Class for managing user and default configuration.
 * Default config is applied on top of user provided configuration
 */
export class ApolloOfflineClientConfig {
  public httpUrl?: string;
  public offlineQueueListener?: ApolloOfflineQueueListener;
  public networkStatus?: NetworkStatus;
  public terminatingLink: ApolloLink | undefined;
  public cacheStorage: PersistentStore<PersistedData>;
  public offlineStorage: PersistentStore<PersistedData>;
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
    this.link = createDefaultLink(this);
  }
}
