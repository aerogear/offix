import { MutationOptions } from "apollo-client";
import {
  OfflineStore,
  OfflineQueueListener,
  OfflineQueue,
  QueueEntryOperation,
  QueueEntry
} from "offix-scheduler";

/**
 * An OfflineQueue instance for queueing Apollo Client mutations.
 * The QueueEntries hold MutationOptions objects
 * which are passed into ApolloClient.mutate()
 */
export type ApolloOfflineQueue = OfflineQueue<MutationOptions>;

/**
 * An OfflineStore instance for persisting Apollo Client Mutations.
 * The store persists MutationOptions objects
 * which can be restored to the OfflineQueue.
 */
export type ApolloOfflineStore = OfflineStore<MutationOptions>;

/**
 * An interface for reacting to events fired by the
 * ApolloOfflineQueue.
 */
export type ApolloOfflineQueueListener = OfflineQueueListener<MutationOptions>;

/**
 * The top level entry held in the ApolloOfflineQueue.
 * It holds a MutationOptions object which is passed into
 * ApolloClient.mutate() and also holds the resolve/reject
 * Promise handlers for OfflineClient.offlineMutate()
 */
export type ApolloQueueEntry = QueueEntry<MutationOptions>;

/**
 * Found inside an ApolloQueueEntry object.
 * The ApolloQueueEntryOperation directly holds the
 * MutationOptions object passed into ApolloClient.mutate()
 */
export type ApolloQueueEntryOperation = QueueEntryOperation<MutationOptions>;

/**
 * Extension to ApolloClient providing additional capabilities.
 *
 * @see ApolloClient
 */
// export interface ApolloOfflineClient extends ApolloClient<NormalizedCacheObject> {
//   /**
//    * Store that can be used to retrieve offline changes
//    * Developers can use it to visualize offline changes in their application
//    */
//   offlineStore: ApolloOfflineStore;

//   /**
//    * In Memory Queue that holds all pending offline operations
//    */
//   queue: ApolloOfflineQueue;

//   /**
//    * Allows to register offline queue listener
//    * to listen for various changes in queue
//    *
//    * @param listener
//    */
//   registerOfflineEventListener(listener: ApolloOfflineQueueListener): void;

//   /**
//    * Allows the client to perform an offline mutation
//    * @param options the mutation helper options used to build the offline mutation
//    */
//   offlineMutate<T = any, TVariables = OperationVariables>(
//     options: MutationHelperOptions<T, TVariables>): Promise<FetchResult<T>>;

//   /**
//    * TODO: Remove this in the next release
//    * Deprecated in favour of offlineMutate
//    * Allows the client to perform an offline mutation
//    * @param options the mutation helper options used to build the offline mutation
//    */
//   offlineMutate<T = any, TVariables = OperationVariables>(
//     options: MutationHelperOptions<T, TVariables>): Promise<FetchResult<T>>;

// }
