import { PersistentStore, PersistedData } from "./PersistentStore";
import { DataSyncConfig } from "../..";
import { OperationQueueEntry, OfflineItem } from "../OperationQueueEntry";
import { SyncConfig } from "../../config/SyncConfig";

/**
 * Abstract Offline storage
 */
export class OfflineStore {

  private storage: PersistentStore<PersistedData>;
  private offlineMetaKey: string = "offline-meta-data";
  private arrayOfKeys: string[];

  constructor(config: SyncConfig) {
    this.storage = config.offlineStorage;
    this.arrayOfKeys = [];
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
  public async saveEntry(entry: OperationQueueEntry) {
    this.arrayOfKeys.push(entry.id);
    await this.storage.setItem(this.offlineMetaKey, this.arrayOfKeys);
    await this.storage.setItem(this.getOfflineKey(entry.id), entry.toOfflineItem());
  }

  /**
   * Remove an entry from the store
   *
   * @param queue - the entry to be removed
   */
  public async removeEntry(entry: OperationQueueEntry) {
    this.arrayOfKeys.splice(this.arrayOfKeys.indexOf(entry.id), 1);
    this.storage.setItem(this.offlineMetaKey, this.arrayOfKeys);
    const offlineKey = this.getOfflineKey(entry.id);
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
