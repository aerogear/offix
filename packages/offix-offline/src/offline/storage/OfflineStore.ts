import { PersistentStore, PersistedData } from "./PersistentStore";
import { QueueEntryOperation, QueueEntry } from "../OfflineQueue";
import { OfflineStoreSerializer } from "./OfflineStoreSerializer";

/**
 * Abstract Offline storage
 */
export class OfflineStore<T> {

  private storage: PersistentStore<PersistedData>;
  private offlineMetaKey: string = "offline-meta-data";
  private storageVersion: string = "v1";
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
    const serialized = this.serializer.serializeForStorage(entry);
    const offlineKey = this.getOfflineKey(entry.qid);
    this.arrayOfKeys.push(offlineKey);
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
    const offlineKey = this.getOfflineKey(entry.qid);
    await this.storage.removeItem(offlineKey);
  }

  /**
   * Fetch data from the offline store
   */
  public async getOfflineData(): Promise<Array<QueueEntry<T>>> {
    const offlineItems: Array<QueueEntry<T>> = [];
    for (const key of this.arrayOfKeys) {
      const keyVersion = key.split(":")[0];
      if (keyVersion === this.storageVersion) {
        const item = await this.storage.getItem(key);
        const deserializedItem = this.serializer.deserializeFromStorage(item);
        offlineItems.push({
          operation: {
            op: deserializedItem as unknown as T,
            qid: key.slice(this.storageVersion.length + 1) // remove the 'v1:' from the key when we put it back in the queue
          }
        });
      }
      // should we log that the item couldm't be loaded?
    }
    return offlineItems;
  }

  private getOfflineKey(id: string): string {
    return `${this.storageVersion}:${id}`;
  }
}
