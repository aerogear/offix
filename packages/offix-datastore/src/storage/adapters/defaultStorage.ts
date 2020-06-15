import { IndexedDBStorage } from "./IndexedDBStorage";
import { Model } from "../../models";

export function createDefaultStorage(models: Model[], schemaVersion: number) {
    return new IndexedDBStorage(models, schemaVersion);
}
