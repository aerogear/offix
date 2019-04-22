import { PersistentStore, PersistedData } from "../PersistentStore";
import { DataSyncConfig } from "..";
import { OperationQueueEntry, OfflineItem } from "./OperationQueueEntry";

/**
 * Abstract Offline storage
 */
export class OfflineStore {

  private storage: PersistentStore<PersistedData>;
  private readonly storageKey: string;

  constructor(clientConfig: DataSyncConfig) {
    this.storage = clientConfig.storage as PersistentStore<PersistedData>;
    this.storageKey = clientConfig.mutationsQueueName;
  }

  /**
   * Save data to store
   *
   * @param queue - array of offline elements to store
   */
  public async persistOfflineData(queue: OperationQueueEntry[]) {
    const offlineItems = queue.map((item: OperationQueueEntry) => {
      return item.toOfflineItem();
    });
    if (this.storage && this.storageKey) {
      await this.storage.setItem(this.storageKey, JSON.stringify(offlineItems));
    }
  }

  /**
   * Fetch data from the
   */
  public async getOfflineData(): Promise<OfflineItem[]> {
    const stored = this.storage.getItem(this.storageKey);
    let offlineData;
    if (stored) {
      offlineData = JSON.parse(stored.toString());
    } else {
      offlineData = [];
    }
    return offlineData;
  }
}
