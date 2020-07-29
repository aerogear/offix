import { IndexedDBStorageAdapter } from "./indexeddb/IndexedDBStorageAdapter";

export function createDefaultStorage() {
    return new IndexedDBStorageAdapter();
}
