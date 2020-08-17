import { v1 as uuidv1 } from "uuid";
import { StorageAdapter } from "./api/StorageAdapter";
import { createLogger } from "../utils/logger";
import { ModelSchema } from "../ModelSchema";
import { Filter } from "../filters";

const logger = createLogger("storage");

export function generateId() {
  return uuidv1();
}

/**
 * Implements local storage that saves data to specified adapter (underlying store)
 * and notifies developers about changes in store.
 */
export class LocalStorage {

  public readonly adapter: StorageAdapter;

  constructor(adapter: StorageAdapter) {
    this.adapter = adapter;
  }

  /**
   * @returns a new LocalStorage instance in transaction mode
   * In transaction, no events are fired unitll the transaction is committed.
   */
  public async createTransaction() {
    logger("creating transaction");
    const adapterTransaction = await this.adapter.createTransaction();
    return new LocalStorage(adapterTransaction);
  }

  /**
   * Commits a transaction if one is open.
   * @throws Will throw error if not in transaction
   */
  public async commit() {
    await this.adapter.commit();
  }

  /**
   * Rollback all changes that occured in this transaction, if one is open.
   * @throws Will throw error if not in transaction
   */
  public async rollback() {
    await this.adapter.rollback();
  }

  public async save(storeName: string, input: any): Promise<any> {
    // TODO id is hardcoded
    const result = await this.adapter.save(storeName, { id: generateId(), ...input });
    return result;
  }

  public query(storeName: string, filter?: Filter): Promise<any | any[]> {
    return this.adapter.query(storeName, filter);
  }

  public queryById(storeName: string, id: string) {
    return this.adapter.queryById(storeName, id);
  }

  public async update(storeName: string, input: any, filter?: Filter): Promise<any> {
    const result = await this.adapter.update(storeName, input, filter);
    return result;
  }

  public updateById(storeName: string, input: any) {
    return this.adapter.updateById(storeName, input);
  }

  public saveOrUpdate(storeName: string, input: any) {
    return this.adapter.saveOrUpdate(storeName, input);
  }

  public async remove(storeName: string, filter?: Filter): Promise<any | any[]> {
    const result = await this.adapter.remove(storeName, filter);
    return result;
  }

  public removeById(storeName: string, id: string) {
    return this.adapter.removeById(storeName, id);
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

  /**
   * Create store in underlying storage provider
   *
   * @param config
   */
  public addStore(config: ModelSchema) {
    this.adapter.addStore(config);
  }

  /**
   * Trigger creation of stores in underlying storage provider
   *
   * @param config
   */
  public createStores() {
    this.adapter.createStores();
  }
}
