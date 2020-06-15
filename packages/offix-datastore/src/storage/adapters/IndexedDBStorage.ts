import { Model, PersistedModel } from "../../models";
import { IStorageAdapter } from "../Storage";
import { getStoreNameFromModelName } from "../core";
import { PredicateFunction } from "../../predicates";

const DB_NAME = "offix-datastore";

export class IndexedDBStorage implements IStorageAdapter {
    public readonly indexedDB: Promise<IDBDatabase>;

    constructor(models: Model[], schemaVersion: number) {
        this.indexedDB = new Promise((resolve, reject) => {
            const openreq = indexedDB.open(DB_NAME, schemaVersion);
            openreq.onerror = () => reject(openreq.error);
            openreq.onsuccess = () => {
                const db = openreq.result;
                db.onversionchange = function() {
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
                    if (modelStore) { return; }

                    // model has been removed, remove it's store
                    db.deleteObjectStore(storeName);
                }
                models.forEach(({ __typename }: Model) => {
                    const storeName = getStoreNameFromModelName(__typename);
                    if (storeNames.contains(storeName)) { return; }
                    db.createObjectStore(storeName, { keyPath: "id" });
                });
            };
        });
    }

    async save(model: PersistedModel) {
        const store = await this.getStore(model.__typename);
        const key = await this.convertToPromise<IDBValidKey>(store.add(model));
        return this.convertToPromise<PersistedModel>(store.get(key));
    }

    async query(modelName: string, predicate?: PredicateFunction) {
        const store = await this.getStore(modelName);
        const all = await this.convertToPromise<PersistedModel[]>(store.getAll());

        if (!predicate) { return all; }
        return predicate.filter(all);
    }

    async update(model: PersistedModel) {
        const store = await this.getStore(model.__typename);
        const key = await this.convertToPromise<IDBValidKey>(store.put(model));
        return this.convertToPromise<PersistedModel>(store.get(key));
    }

    async remove(model: PersistedModel, predicate?: PredicateFunction) {
        const store = await this.getStore(model.__typename);

        if (!predicate) {
            await this.convertToPromise(store.delete(model.id));
            return model;
        }

        const all = await this.convertToPromise<PersistedModel[]>(store.getAll());
        const targets = predicate.filter(all);
        await Promise.all(
            targets.map((t) => this.convertToPromise(store.delete(t.id)))
        );
        return targets;
    }

    private async getStore(modelName: string) {
        const db = await this.indexedDB;
        const storeName = getStoreNameFromModelName(modelName);
        return db.transaction(storeName, "readwrite")
            .objectStore(storeName);
    }

    private convertToPromise<T>(request: IDBRequest) {
        return new Promise<T>((resolve, reject) => {
            request.onsuccess = (event) => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                reject(request.error);
            };
        });
    }
}
