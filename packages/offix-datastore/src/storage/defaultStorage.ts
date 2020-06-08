import { IndexedDBStorage } from "./IndexedDBStorage";
import { Model } from "../models";

export function createDefaultStorage(models: Model[]) {
    return new IndexedDBStorage(models);
}
