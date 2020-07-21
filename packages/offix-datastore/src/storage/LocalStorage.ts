import { v1 as uuidv1 } from "uuid";
import { PushStream, ObservablePushStream } from "../utils/PushStream";
import { PredicateFunction } from "../predicates";
import { CRUDEvents } from "./api/CRUDEvents";
import { StorageAdapter } from "./api/StorageAdapter";
import { StoreChangeEvent, StoreEventSource } from "./api/StoreChangeEvent";
import { createLogger } from "../utils/logger";

const logger = createLogger("storage");

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
  private eventQueue: StoreChangeEvent[] = [];

  constructor(adapter: StorageAdapter, pushStream?: PushStream<StoreChangeEvent>) {
    this.storeChangeEventStream = pushStream || new ObservablePushStream();
    this.adapter = adapter;
  }

  /**
   * @returns a new LocalStorage instance in transaction mode
   * In transaction, no events are fired unitll the transaction is committed.
   */
  public async createTransaction() {
    logger("creating transaction");
    const adapterTransaction = await this.adapter.createTransaction();
    return new LocalStorage(adapterTransaction, this.storeChangeEventStream);
  }

  /**
   * Commits a transaction if one is open.
   * It fires all events that occured in this transaction
   * @throws Will throw error if not in transaction
   */
  public async commit() {
    await this.adapter.commit();
    this.eventQueue.forEach((event) => this.storeChangeEventStream.push(event));
  }

  /**
   * Rollback all changes that occured in this transaction, if one is open.
   * All events that occured within this transaction are cleared.
   * @throws Will throw error if not in transaction
   */
  public async rollback() {
    await this.adapter.rollback();
    this.eventQueue = [];
  }

  public async save(storeName: string, input: any, eventSource: StoreEventSource = "user"): Promise<any> {
    const result = await this.adapter.save(storeName, { id: generateId(), ...input });
    this.dispatchEvent({
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
    this.dispatchEvent({
      eventType: CRUDEvents.UPDATE,
      data: result,
      storeName,
      eventSource
    });
    return result;
  }

  public async remove(storeName: string, predicate?: PredicateFunction, eventSource: StoreEventSource = "user"): Promise<any | any[]> {
    const result = await this.adapter.remove(storeName, predicate);
    this.dispatchEvent({
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

  private dispatchEvent(event: StoreChangeEvent) {
    if (!this.adapter.isTransactionOpen()) {
      this.storeChangeEventStream.push(event);
    }

    this.eventQueue.push(event);
  }
}
