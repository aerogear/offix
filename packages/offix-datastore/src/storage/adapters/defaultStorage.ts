import { IndexedDBStorage } from "./IndexedDBStorage";
import { Model } from "../../Model";

export function createDefaultStorage(dbName: string, models: Model[], schemaVersion: number) {
    return new IndexedDBStorage(dbName, models, schemaVersion);
}
