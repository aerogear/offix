import { IndexedDBStorage } from "./IndexedDBStorage";

export function createDefaultStorage() {
    return new IndexedDBStorage();
}
