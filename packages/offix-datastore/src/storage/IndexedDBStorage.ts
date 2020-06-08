import { Model } from "../models";
import { Storage } from "./Storage";

const DB_NAME = "offix-datastore";

export class IndexedDBStorage implements Storage {
    private indexedDB: Promise<IDBDatabase>;

    constructor(models: Model[]) {
        this.indexedDB = new Promise((resolve, reject) => {
            const openreq = indexedDB.open(DB_NAME, 1);
            openreq.onerror = () => reject(openreq.error);
            openreq.onsuccess = () => resolve(openreq.result);

            openreq.onupgradeneeded = () => {
                models.forEach(({ storeName }: Model) => {
                    openreq.result.createObjectStore(storeName);
                });
            };
        });
    }
}
