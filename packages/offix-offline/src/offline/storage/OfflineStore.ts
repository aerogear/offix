import { PersistentStore, PersistedData } from "./PersistentStore";
import { OperationQueueEntry, OfflineItem } from "../OperationQueueEntry";
import { QueueEntryOperation } from "../OfflineQueue";
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
  public async getOfflineData(): Promise<OfflineItem[]> {
    const offlineItems: OfflineItem[] = [];
    for (const key of this.arrayOfKeys) {
      const item = await this.storage.getItem(this.getOfflineKey(key));
      if (typeof item === "string") {
        offlineItems.push(JSON.parse(item));
      } else if (item) {
        offlineItems.push(item as OfflineItem);
      }
    }
    return offlineItems;
  }

  private getOfflineKey(id: string): string {
    return "offline:" + id;
  }
}
