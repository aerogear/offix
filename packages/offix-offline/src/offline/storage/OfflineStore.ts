import { PersistentStore, PersistedData } from "./PersistentStore";
import { QueueEntryOperation, QueueEntry } from "../OfflineQueue";
import { Serializer, ApolloOperationSerializer } from "./Serializer";

/**
 * Abstract Offline storage
 */
export class OfflineStore {

  private storage: PersistentStore<PersistedData>;
  private offlineMetaKey: string = "offline-meta-data";
  private arrayOfKeys: string[];
  private serializer: Serializer

  constructor(storage: PersistentStore<PersistedData>) {
    this.storage = storage;
    this.arrayOfKeys = [];
    this.serializer = ApolloOperationSerializer;
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
  public async saveEntry(entry: QueueEntryOperation) {
    this.arrayOfKeys.push(entry.qid);
    await this.storage.setItem(this.offlineMetaKey, this.arrayOfKeys);
    await this.storage.setItem(this.getOfflineKey(entry.qid), this.serializer.serializeForStorage(entry));
  }

  /**
   * Remove an entry from the store
   *
   * @param queue - the entry to be removed
   */
  public async removeEntry(entry: QueueEntryOperation) {
    this.arrayOfKeys.splice(this.arrayOfKeys.indexOf(entry.qid), 1);
    this.storage.setItem(this.offlineMetaKey, this.arrayOfKeys);
    const offlineKey = this.getOfflineKey(entry.qid);
    await this.storage.removeItem(offlineKey);
  }

  /**
   * Fetch data from the offline store
   */
  public async getOfflineData(): Promise<QueueEntry[]> {
    const offlineItems: QueueEntry[] = [];
    for (const key of this.arrayOfKeys) {
      let item = await this.storage.getItem(this.getOfflineKey(key));
      if (typeof item === "string") {
        item = JSON.parse(item)
      }
      offlineItems.push({
        operation: {
          op: item,
          qid: key
        }
      })
    }
    return offlineItems;
  }

  private getOfflineKey(id: string): string {
    return "offline:" + id;
  }
}
