import { PushStream, ObservablePushStream } from "../utils/PushStream";
import { PredicateFunction } from "../predicates";
import { CRUDEvents } from "./api/CRUDEvents";
import { StorageAdapter } from "./api/StorageAdapter";
import { StoreChangeEvent, StoreEventSource } from "./api/StoreChangeEvent";

import { v1 as uuidv1 } from "uuid";

export function generateId() {
  return uuidv1();
}

/**
 * Implements local storage that saves data to specified adapter (underlying store)
 * and notifies developers about changes in store.
 */
export class LocalStorage {
  public readonly storeChangeEventStream: PushStream<StoreChangeEvent>;
  public readonly adapter: StorageAdapter;

  constructor(adapter: StorageAdapter) {
    this.storeChangeEventStream = new ObservablePushStream();
    this.adapter = adapter;
  }

  public async save(storeName: string, input: any, eventSource: StoreEventSource = "user"): Promise<any> {
    const result = await this.adapter.save(storeName, { id: generateId(), ...input });
    this.storeChangeEventStream.push({
      eventType: CRUDEvents.ADD,
      data: result,
      storeName,
      eventSource
    });
    return result;
  }

  public query(storeName: string, predicate?: PredicateFunction): Promise<any | any[]> {
    return this.adapter.query(storeName, predicate);
  }

  public async update(storeName: string, input: any, predicate?: PredicateFunction, eventSource: StoreEventSource = "user"): Promise<any> {
    const result = await this.adapter.update(storeName, input, predicate);
    this.storeChangeEventStream.push({
      eventType: CRUDEvents.UPDATE,
      data: result,
      storeName,
      eventSource
    });
    return result;
  }

  public async remove(storeName: string, predicate?: PredicateFunction, eventSource: StoreEventSource = "user"): Promise<any | any[]> {
    const result = await this.adapter.remove(storeName, predicate);
    this.storeChangeEventStream.push({
      eventType: CRUDEvents.DELETE,
      data: result,
      storeName,
      eventSource
    });
    return result;
  }

  /**
   * Write metadata store.
   * This particular store is not going to notify model listeners
   * and can only exist as full write.
   * @param storeName
   * @param input
   */
  public async writeMetadata(storeName: string, input: any): Promise<any> {
    const result = await this.adapter.save(storeName, input);

    return result;
  }

  /**
   * Read metadata store.
   * This particular store is not going to notify model listeners
   * and can only exist as full write.
   * @param storeName
   */
  public async readMetadata(storeName: any): Promise<any> {
    return this.adapter.query(storeName);
  }
}
