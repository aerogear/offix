import { IndexedDBStorageAdapter } from "./IndexedDBStorageAdapter";

export function createDefaultStorage() {
    return new IndexedDBStorageAdapter();
}
