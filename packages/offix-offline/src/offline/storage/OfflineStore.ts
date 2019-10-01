import { PersistentStore, PersistedData } from "./PersistentStore";
import { QueueEntryOperation, QueueEntry } from "../OfflineQueue";
import { OfflineStoreSerializer } from "./OfflineStoreSerializer";

/**
 * Abstract Offline storage
 */
export class OfflineStore<T> {

  private storage: PersistentStore<PersistedData>;
  private offlineMetaKey: string = "offline-meta-data";
  private arrayOfKeys: string[];
  private serializer: OfflineStoreSerializer<T>;

  constructor(storage: PersistentStore<PersistedData>, serializer: OfflineStoreSerializer<T>) {
    this.arrayOfKeys = [];
    this.storage = storage;
    this.serializer = serializer;
  }

  /**
   * Init store
   */
  public async init() {
    const keys = await this.storage.getItem(this.offlineMetaKey) as string[];
    this.arrayOfKeys = keys || [];
  }

  /**
   * Save an entry to store
   *
   * @param entry - the entry to be saved
   */
  public async saveEntry(entry: QueueEntryOperation<T>) {
    this.arrayOfKeys.push(entry.qid);
    const serialized = this.serializer.serializeForStorage(entry);
    const offlineKey = getOfflineKey(entry.qid);
    await this.storage.setItem(this.offlineMetaKey, this.arrayOfKeys);
    await this.storage.setItem(offlineKey, serialized);
  }

  /**
   * Remove an entry from the store
   *
   * @param queue - the entry to be removed
   */
  public async removeEntry(entry: QueueEntryOperation<T>) {
    this.arrayOfKeys.splice(this.arrayOfKeys.indexOf(entry.qid), 1);
    this.storage.setItem(this.offlineMetaKey, this.arrayOfKeys);
    const offlineKey = getOfflineKey(entry.qid);
    await this.storage.removeItem(offlineKey);
  }

  /**
   * Fetch data from the offline store
   */
  public async getOfflineData(): Promise<Array<QueueEntry<T>>> {
    const offlineItems: Array<QueueEntry<T>> = [];
    for (const key of this.arrayOfKeys) {
      const item = await this.storage.getItem(getOfflineKey(key));
      const deserializedItem = this.serializer.deserializeFromStorage(item);
      offlineItems.push({
        operation: {
          op: deserializedItem as unknown as T,
          qid: key
        }
      });
    }
    return offlineItems;
  }
}

function getOfflineKey(id: string): string {
  return "offline:" + id;
}
