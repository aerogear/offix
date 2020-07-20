import { StorageAdapter } from "../api/StorageAdapter";
import { IStoreConfig } from "../api/StoreConfig";
import { PredicateFunction } from "../../predicates";
import { generateId } from "../LocalStorage";

/**
 * Web Storage Implementation for DataStore using IndexedDB
 */
export class IndexedDBStorageAdapter implements StorageAdapter {
    private indexedDB: Promise<IDBDatabase>;
    private stores: IStoreConfig[] = [];
    private resolveIDB: any;
    private rejectIDB: any;
    private transaction?: IDBTransaction;

    constructor(transaction?: IDBTransaction) {
        this.indexedDB = new Promise((resolve, reject) => {
            this.resolveIDB = resolve;
            this.rejectIDB = reject;
        });
        this.transaction = transaction;
    }

    public addStore(config: IStoreConfig) {
        this.stores.push(config);
    }

    public createStores(dbName: string, schemaVersion: number) {
        const openreq = indexedDB.open(dbName, schemaVersion);
        openreq.onerror = () => this.rejectIDB(openreq.error);
        openreq.onsuccess = () => {
            const db = openreq.result;
            db.onversionchange = function() {
                this.close();
                // alert("Please reload the page.");
            };
            this.resolveIDB(db);
        };

        openreq.onupgradeneeded = () => {
            const db = openreq.result;
            const existingStoreNames = db.objectStoreNames;

            for (let i = 0; i < existingStoreNames.length; i++) {
                const storeName = (existingStoreNames.item(i) as string);
                const existingModelStoreName = this.stores.find((({ name }) => (storeName === name)));
                if (existingModelStoreName) { return; }

                // model has been removed, remove it's store
                db.deleteObjectStore(storeName);
            }

            this.stores.forEach(({ name, keyPath }) => {
                if (existingStoreNames.contains(name)) { return; }
                db.createObjectStore(name, { keyPath: keyPath || "id" });
            });
        };
    }

    public async createTransaction() {
        const db = await this.indexedDB;
        const transaction = db.transaction((db.objectStoreNames as unknown as string[]), "readwrite");
        return new IndexedDBStorageAdapter(transaction);
    }

    public commit() {
        return new Promise<void>((resolve, reject) => {
            if (!this.transaction) {
                reject(new Error("Transaction is not open"));
                return;
            }

            this.transaction.onerror = (ev) => { reject(this.transaction?.error); };
            this.transaction.oncomplete = () => { resolve(); };
        });
    }

    public rollback() {
        return new Promise<void>((resolve, reject) => {
            if (!this.transaction) {
                reject(new Error("Transaction is not open"));
                return;
            }

            this.transaction.onabort = () => { resolve(); };
            this.transaction.abort();
        });
    }

    public isTransactionOpen() {
        return (this.transaction !== undefined);
    }

    public async save(storeName: string, input: any) {
        const store = await this.getStore(storeName);
        const key = await this.convertToPromise<IDBValidKey>(store.add({ id: generateId(), ...input }));
        return this.convertToPromise<any>(store.get(key));
    }

    public async query(storeName: string, predicate?: PredicateFunction) {
        const store = await this.getStore(storeName);
        const all = await this.convertToPromise<any[]>(store.getAll());

        if (!predicate) { return all; }
        return predicate.filter(all);
    }

    public async update(storeName: string, input: any, predicate?: PredicateFunction) {
        const targets = await this.query(storeName, predicate);
        const store = await this.getStore(storeName);

        const promises = targets.map((data) => this.convertToPromise<IDBValidKey>(
            store.put({ ...data, ...input }))
        );
        await Promise.all(promises);
        return this.query(storeName, predicate);
    }

    public async remove(storeName: string, predicate?: PredicateFunction) {
        const store = await this.getStore(storeName);
        const all = await this.convertToPromise<any[]>(store.getAll());
        let targets = all;
        if (predicate) {
            targets = predicate.filter(all);
        }
        await Promise.all(
            targets.map((t) => this.convertToPromise(store.delete(t.id)))
        );
        return targets;
    }

    public getIndexedDBInstance() {
        return this.indexedDB;
    }

    private async getStore(storeName: string) {
        if (this.transaction) {
            return this.transaction.objectStore(storeName);
        }
        const db = await this.indexedDB;
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
