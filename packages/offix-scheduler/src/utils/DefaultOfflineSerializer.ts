import { OfflineStoreSerializer, QueueEntryOperation, PersistedData } from "offix-offline";

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
