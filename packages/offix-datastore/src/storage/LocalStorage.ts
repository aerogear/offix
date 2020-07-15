import { ObservablePushStream } from "../utils/PushStream";
import { PredicateFunction } from "../predicates";
import { createDefaultStorage } from "./adapters/defaultStorage";
import { Model } from "../Model";
import { CRUDEvents } from "./api/CRUDEvents";
import { StorageAdapter } from "./api/StorageAdapter";

import { v1 as uuidv1 } from "uuid";

export function generateId() {
  return uuidv1();
}

/**
 * Implements local storage that saves data to specified adapter (underlying store)
 * and notifies developers about changes in store.
 */
export class LocalStorage {

  private adapter: StorageAdapter;

  constructor(dbName: string, models: Model[], schemaVersion: number) {
    this.adapter = createDefaultStorage(dbName, models, schemaVersion);
  }

  public async save(storeName: string, input: any): Promise<any> {
    return await this.adapter.save(storeName, { id: generateId(), ...input });
  }

  public query(storeName: string, predicate?: PredicateFunction): Promise<any | any[]> {
    return this.adapter.query(storeName, predicate);
  }

  public async update(storeName: string, input: any, predicate?: PredicateFunction): Promise<any> {
    return await this.adapter.update(storeName, input, predicate);
  }

  public async remove(storeName: string, predicate?: PredicateFunction): Promise<any | any[]> {
    return await this.adapter.remove(storeName, predicate);
  }
}
