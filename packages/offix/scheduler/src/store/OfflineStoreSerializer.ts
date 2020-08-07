import { QueueEntryOperation } from "../queue";
import { PersistedData } from "./PersistentStore";

/**
 * OfflineStoreSerializer knows how to take generic enties in the Offline Queue
 * and ensure they can be stored safely.
 * Needed because the OfflineQueue and OfflineStorage are generic now
 * See ApolloOperationSerializer for an example.
 */
export interface OfflineStoreSerializer<T> {
  serializeForStorage(entry: QueueEntryOperation<T>): any;
  deserializeFromStorage(persistedEntry: PersistedData): any;
}

export class DefaultOfflineSerializer implements OfflineStoreSerializer<any> {
  public serializeForStorage({ op }: QueueEntryOperation<any>) {
    return JSON.stringify(op);
  }

  public deserializeFromStorage(persistedEntry: PersistedData) {
    if (typeof persistedEntry === "string") {
      return JSON.parse(persistedEntry);
    }
    return persistedEntry;
  }
}
