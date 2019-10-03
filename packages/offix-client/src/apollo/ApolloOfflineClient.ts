import { NormalizedCacheObject } from "apollo-cache-inmemory";
import { ApolloClient, OperationVariables, MutationOptions } from "apollo-client";
import { FetchResult } from "apollo-link";
import {
  OfflineStore,
  OfflineQueueListener,
  OfflineQueue,
  IResultProcessor,
  QueueEntryOperation,
  QueueEntry
} from "offix-offline";
import { MutationHelperOptions } from "offix-cache";

export type ApolloOfflineQueue = OfflineQueue<MutationOptions>;
export type ApolloOfflineStore = OfflineStore<MutationOptions>;
export type ApolloOfflineQueueListener = OfflineQueueListener<MutationOptions>;
export type ApolloIResultProcessor = IResultProcessor<MutationOptions>;
export type ApolloQueueEntry = QueueEntry<MutationOptions>;
export type ApolloQueueEntryOperation = QueueEntryOperation<MutationOptions>;

/**
 * Extension to ApolloClient providing additional capabilities.
 *
 * @see ApolloClient
 */
export interface ApolloOfflineClient extends ApolloClient<NormalizedCacheObject> {
  /**
   * Store that can be used to retrieve offline changes
   * Developers can use it to visualize offline changes in their application
   */
  offlineStore: ApolloOfflineStore;

  /**
   * In Memory Queue that holds all pending offline operations
   */
  queue: ApolloOfflineQueue;

  /**
   * Allows to register offline queue listener
   * to listen for various changes in queue
   *
   * @param listener
   */
  registerOfflineEventListener(listener: ApolloOfflineQueueListener): void;

  /**
   * Allows the client to perform an offline mutation
   * @param options the mutation helper options used to build the offline mutation
   */
  offlineMutate<T = any, TVariables = OperationVariables>(
    options: MutationHelperOptions<T, TVariables>): Promise<FetchResult<T>>;

  /**
   * TODO: Remove this in the next release
   * Deprecated in favour of offlineMutate
   * Allows the client to perform an offline mutation
   * @param options the mutation helper options used to build the offline mutation
   */
  offlineMutate<T = any, TVariables = OperationVariables>(
    options: MutationHelperOptions<T, TVariables>): Promise<FetchResult<T>>;

}
