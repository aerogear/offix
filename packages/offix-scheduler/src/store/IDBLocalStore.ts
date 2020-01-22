export class IDBLocalStore {
  public readonly _dbp: Promise<IDBDatabase>;

  constructor(dbName = "graphqlstore", readonly storeName = "keyval") {
    this._dbp = new Promise((resolve, reject) => {
      const openreq = indexedDB.open(dbName, 1);
      openreq.onerror = () => reject(openreq.error);
      openreq.onsuccess = () => resolve(openreq.result);

      // First time setup: create an empty object store
      openreq.onupgradeneeded = () => {
        openreq.result.createObjectStore(storeName);
      };
    });
  }

  public _withIDBStore(type: IDBTransactionMode, callback: ((store: IDBObjectStore) => void)): Promise<void> {
    return this._dbp.then(db => new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(this.storeName, type);
      transaction.oncomplete = () => resolve();
      transaction.onabort = transaction.onerror = () => reject(transaction.error);
      callback(transaction.objectStore(this.storeName));
    }));
  }

  public getItem<Type>(key: IDBValidKey): Promise<Type> {
    let req: IDBRequest;
    return this._withIDBStore("readonly", store => {
      req = store.get(key);
    }).then(() => req.result);
  }

  public setItem(key: IDBValidKey, value: any): Promise<void> {
    return this._withIDBStore("readwrite", store => {
      store.put(value, key);
    });
  }

  public removeItem(key: IDBValidKey): Promise<void> {
    return this._withIDBStore("readwrite", store => {
      store.delete(key);
    });
  }

  public clear(): Promise<void> {
    return this._withIDBStore("readwrite", store => {
      store.clear();
    });
  }

  public keys(): Promise<IDBValidKey[]> {
    const keys: IDBValidKey[] = [];

    return this._withIDBStore("readonly", store => {
      // This would be store.getAllKeys(), but it isn't supported by Edge or Safari.
      // And openKeyCursor isn't supported by Safari.
      // eslint-disable-next-line
      (store.openKeyCursor || store.openCursor).call(store).onsuccess = function() {
        if (!this.result) { return; }
        keys.push(this.result.key);
        this.result.continue();
      };
    }).then(() => keys);
  }
}
