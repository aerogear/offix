import ApolloClient, { MutationOptions, OperationVariables } from "apollo-client";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { OffixScheduler } from "offix-scheduler";
import { CachePersistor } from "apollo-cache-persist";
import { MutationHelperOptions, CacheUpdates, createMutationOptions  } from "offix-cache";
import { FetchResult } from "apollo-link";
import {
  ApolloOperationSerializer,
  ApolloOfflineQueue,
  ApolloOfflineStore,
  addOptimisticResponse,
  removeOptimisticResponse,
  restoreOptimisticResponse,
  replaceClientGeneratedIDsInQueue,
  ApolloQueueEntryOperation,
  ApolloOfflineQueueListener,
  getBaseStateFromCache,
  ApolloCacheWithData
} from "./apollo";
import { NetworkStatus } from "offix-offline";
import { ObjectState } from "offix-conflicts-client";
import { ApolloOfflineClientOptions, InputMapper } from "./config/ApolloOfflineClientOptions";
import { ApolloOfflineClientConfig } from "./config/ApolloOfflineClientConfig";

export class ApolloOfflineClient extends ApolloClient<NormalizedCacheObject> {

  // wrapper around the apollo cache for persisting it across restarts
  public persistor: CachePersistor<object>;
  // the offix scheduler
  public scheduler: OffixScheduler<MutationOptions>;
  // the offline storage interface that persists offline data across restarts
  public offlineStore?: ApolloOfflineStore;
  // interface that performs conflict detection and resolution
  public conflictProvider: ObjectState;
  // the network status interface that determines online/offline state
  public networkStatus: NetworkStatus;
  // the in memory queue that holds offline data
  public queue: ApolloOfflineQueue;
  // cache update functions for mutations. Used to restore optimistic responses after restarts
  public mutationCacheUpdates?: CacheUpdates;
  // true after client is initialized
  public initialized: boolean;
  // mapper function for mapping mutation variables
  public inputMapper?: InputMapper;

  constructor(options: ApolloOfflineClientOptions) {
    const config = new ApolloOfflineClientConfig(options);
    super(config);

    this.initialized = false;
    this.mutationCacheUpdates = config.mutationCacheUpdates;
    this.conflictProvider = config.conflictProvider;
    this.inputMapper = config.inputMapper;

    if (config.cachePersistor) {
      if (!(config.cachePersistor instanceof CachePersistor)) {
        throw new Error("Error: options.cachePersistor is not a CachePersistor instance");
      }
      this.persistor = config.cachePersistor;
    } else {
      this.persistor = new CachePersistor({
        cache: this.cache,
        serialize: false,
        storage: config.cacheStorage,
        maxSize: false,
        debug: false
      });
    }

    this.scheduler = new OffixScheduler<MutationOptions>({
      executor: this,
      storage: config.offlineStorage,
      networkStatus: config.networkStatus,
      serializer: ApolloOperationSerializer,
      offlineQueueListener: config.offlineQueueListener
    });

    this.queue = this.scheduler.queue;
    this.networkStatus = this.scheduler.networkStatus;
    this.offlineStore = this.scheduler.offlineStore;
  }

  public async init() {
    if (this.persistor) {
      try {
        await this.persistor.restore();
      } catch(error) {
        console.error("Error restoring Apollo cache from storage.", error);
        console.error("Cache persistence will not be available.");
      }
    }

    // Optimistic Responses
    this.queue.registerOfflineQueueListener({
      onOperationEnqueued: (operation: ApolloQueueEntryOperation) => {
        addOptimisticResponse(this, operation);
      },
      onOperationSuccess: (operation: ApolloQueueEntryOperation, result: FetchResult) => {
        replaceClientGeneratedIDsInQueue(this.scheduler.queue, operation, result);
        removeOptimisticResponse(this, operation);
      },
      onOperationFailure: (operation: ApolloQueueEntryOperation, error) => {
        removeOptimisticResponse(this, operation);
      },
      onOperationRequeued: (operation: ApolloQueueEntryOperation) => {
        if (this.mutationCacheUpdates) {
          restoreOptimisticResponse(this, this.mutationCacheUpdates, operation);
        }
      }
    });
    await this.scheduler.init();
    this.initialized = true;
  }

  public async execute(options: MutationOptions) {
    return this.mutate(options);
  }

  public async offlineMutate<T = any, TVariables = OperationVariables>(
    options: MutationHelperOptions<T, TVariables>): Promise<FetchResult<T>> {
      if (!this.initialized) {
        throw new Error("cannot call client.offlineMutate until client is initialized");
      }
      const mutationOptions = this.createOfflineMutationOptions(options);
      return this.scheduler.execute(mutationOptions as unknown as MutationOptions);
  }

  /**
   * Add new listener for listening for queue changes
   *
   * @param listener
   */
  public registerOfflineEventListener(listener: ApolloOfflineQueueListener) {
    this.scheduler.registerOfflineQueueListener(listener);
  }

  protected createOfflineMutationOptions<T = any, TVariables = OperationVariables>(
    options: MutationHelperOptions<T, TVariables>): MutationOptions<T, TVariables> {
    options.inputMapper = this.inputMapper;
    const offlineMutationOptions = createMutationOptions<T, TVariables>(options);

    offlineMutationOptions.context.conflictBase = getBaseStateFromCache(
      this.cache as unknown as ApolloCacheWithData,
      this.conflictProvider,
      offlineMutationOptions as unknown as MutationOptions,
      this.inputMapper
    );

    if (!offlineMutationOptions.update && this.mutationCacheUpdates) {
      offlineMutationOptions.update = this.mutationCacheUpdates[offlineMutationOptions.context.operationName];
    }
    return offlineMutationOptions;
  }
}
