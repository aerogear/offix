import { Model, PersistedModel } from "../models";
import { Storage } from "./Storage";
import { getStoreNameFromModelName, generateId } from "./core";

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
                    // alert("Please reload the page.");
                };
                resolve(db);
            };

            openreq.onupgradeneeded = () => {
                const db = openreq.result;
                const storeNames = db.objectStoreNames;

                for (let i = 0; i < storeNames.length; i++) {
                    const storeName = (storeNames.item(i) as string);
                    const modelStore = models.find(({ __typename }) => (
                        getStoreNameFromModelName(__typename) === storeName
                    ));
                    if (modelStore) return;

                    // model has been removed, remove it's store
                    db.deleteObjectStore(storeName);
                }
                models.forEach(({ __typename }: Model) => {
                    const storeName = getStoreNameFromModelName(__typename);
                    if (storeNames.contains(storeName)) return;
                    db.createObjectStore(storeName, { keyPath: "id" });
                });
            };
        });
    }

    private async getStore(modelName: string) {
        const db = await this.indexedDB;
        const storeName = getStoreNameFromModelName(modelName);
        return db.transaction(storeName, "readwrite")
            .objectStore(storeName);
    }

    async save(model: Model) {
        const store = await this.getStore(model.__typename);
        const persistedModel = { ...model, id: generateId() };
        const key = await this.convertToPromise<IDBValidKey>(store.add(persistedModel));
        return this.convertToPromise<PersistedModel>(store.get(key));
    }

    async query(modelName: string) {
        const store = await this.getStore(modelName);
        return await this.convertToPromise<PersistedModel[]>(store.getAll());
    }

    private convertToPromise<T>(request: IDBRequest) {
        return new Promise<T>((resolve, reject) => {
            request.onsuccess = (event) => {
                resolve(request.result);
            }

            request.onerror = (event) => {
                reject(request.error);
            }
        });
    }
}
