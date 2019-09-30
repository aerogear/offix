import { QueueEntryOperation } from "../OfflineQueue";

/**
 * A Serializer knows how to take generic enties in the Offline Queue
 * and ensure they can be stored safely.
 * Needed because the OfflineQueue and OfflineStorage are generic now
 * See ApolloOperationSerializer for an example.
 */
export interface Serializer<T> {
  serializeForStorage(entry: QueueEntryOperation<T>): any;
}
