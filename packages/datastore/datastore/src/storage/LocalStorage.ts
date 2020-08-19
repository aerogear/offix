
import { StorageAdapter } from "./api/StorageAdapter";
import { createLogger } from "../utils/logger";
import { ModelSchema } from "../ModelSchema";
import { Filter } from "../filters";

const logger = createLogger("storage");

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
    return await this.adapter.save(storeName, input);
  }

  public query(storeName: string, filter?: Filter): Promise<any | any[]> {
    return this.adapter.query(storeName, filter);
  }

  public queryById(storeName: string, idField: string, id: string) {
    return this.adapter.queryById(storeName, idField, id);
  }

  public async update(storeName: string, input: any, filter?: Filter): Promise<any> {
    const result = await this.adapter.update(storeName, input, filter);
    return result;
  }

  public updateById(storeName: string, idField: string, input: any) {
    return this.adapter.updateById(storeName, idField, input);
  }

  public saveOrUpdate(storeName: string, idField: string, input: any) {
    return this.adapter.saveOrUpdate(storeName, idField, input);
  }

  public async remove(storeName: string, idField: string, filter?: Filter): Promise<any | any[]> {
    const result = await this.adapter.remove(storeName, idField, filter);
    return result;
  }

  public removeById(storeName: string, idField: string, input: any) {
    return this.adapter.removeById(storeName, idField, input);
  }

  public deleteStore(storeName: string) {
    return this.adapter.deleteStore(storeName);
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
