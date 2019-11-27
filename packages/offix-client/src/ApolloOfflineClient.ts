import ApolloClient, { MutationOptions, OperationVariables } from "apollo-client";
import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { PersistedData, PersistentStore, OffixScheduler, createDefaultOfflineStorage } from "offix-scheduler";
import { CachePersistor } from "apollo-cache-persist";
import { MutationHelperOptions, CacheUpdates, createMutationOptions } from "offix-cache";
import { FetchResult } from "apollo-link";
import { createDefaultCacheStorage } from "./cache";
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
  ApolloCacheWithData,
  createDefaultLink
} from "./apollo";
import { NetworkStatus } from "offix-offline";
import { ObjectState, VersionedState } from "offix-conflicts-client";
import { ApolloOfflineClientOptions } from "./config/ApolloOfflineClientOptions";
import { ApolloOfflineClientConfig } from "./config/ApolloOfflineClientConfig";

export class ApolloOfflineClient extends ApolloClient<NormalizedCacheObject> {

  public persistor: CachePersistor<object>;
  public scheduler: OffixScheduler<MutationOptions>;
  public offlineStore?: ApolloOfflineStore;
  public conflictProvider: ObjectState;
  // the network status interface that determines online/offline state
  public networkStatus: NetworkStatus;
  // the in memory queue that holds offline data
  public queue: ApolloOfflineQueue;
  public mutationCacheUpdates?: CacheUpdates;

  constructor(options: ApolloOfflineClientOptions) {
    const config = new ApolloOfflineClientConfig(options);
    super(config);

    this.mutationCacheUpdates = config.mutationCacheUpdates;
    this.conflictProvider = config.conflictProvider || new VersionedState();

    this.persistor = new CachePersistor({
      cache: this.cache,
      serialize: false,
      storage: config.cacheStorage,
      maxSize: false,
      debug: false
    });

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
      await this.persistor.restore();
    }

    // Optimistic Responses
    this.queue.registerOfflineQueueListener({
      onOperationEnqueued: (operation: ApolloQueueEntryOperation) => {
        addOptimisticResponse(this, operation);
      },
      onOperationSuccess: (operation: ApolloQueueEntryOperation, result: FetchResult) => {
        replaceClientGeneratedIDsInQueue(this.scheduler.queue.queue, operation, result);
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
  }

  public async execute(options: MutationOptions) {
    return this.mutate(options);
  }

  public async offlineMutate<T = any, TVariables = OperationVariables>(
    options: MutationHelperOptions<T, TVariables>): Promise<FetchResult<T>> {
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
    const offlineMutationOptions = createMutationOptions<T, TVariables>(options);

    offlineMutationOptions.context.conflictBase = getBaseStateFromCache(
      this.cache as unknown as ApolloCacheWithData,
      this.conflictProvider,
      offlineMutationOptions as unknown as MutationOptions
    );

    if (!offlineMutationOptions.update && this.mutationCacheUpdates) {
      offlineMutationOptions.update = this.mutationCacheUpdates[offlineMutationOptions.context.operationName];
    }
    return offlineMutationOptions;
  }
}
