import { MutationOptions } from "@apollo/client";
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
