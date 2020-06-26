import { IndexedDBStorage } from "./IndexedDBStorage";

export function createDefaultStorage(dbName: string, storeNames: string[], schemaVersion: number) {
    return new IndexedDBStorage(dbName, storeNames, schemaVersion);
}
