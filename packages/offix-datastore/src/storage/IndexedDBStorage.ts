import { Model } from "../models";
import { Storage } from "./Storage";

const DB_NAME = "offix-datastore";

export class IndexedDBStorage implements Storage {
    public readonly indexedDB: Promise<IDBDatabase>;

    constructor(models: Model[], schemaVersion: number) {
        this.indexedDB = new Promise((resolve, reject) => {
            const openreq = indexedDB.open(DB_NAME, schemaVersion);
            openreq.onerror = () => reject(openreq.error);
            openreq.onsuccess = () => {
                const db = openreq.result;
                db.onversionchange = function () {
                    this.close();
                    alert("Please reload the page.");
                };
                resolve(db);
            };

            openreq.onupgradeneeded = () => {
                const db = openreq.result;
                const storeNames = db.objectStoreNames;

                for (let i = 0; i < storeNames.length; i++) {
                    const storeName = (storeNames.item(i) as string);
                    if (models.find((value) => value.storeName === storeName)) return;

                    // model has been removed, remove it's store
                    db.deleteObjectStore(storeName);
                }
                models.forEach(({ storeName }: Model) => {
                    if (storeNames.contains(storeName)) return;
                    db.createObjectStore(storeName);
                });
            };
        });
    }
}
