import { ModelSchema } from "../../ModelSchema";
import { Filter } from "../../filters";

/**
 * This interface defines the API that is required
 * from any device specific storage implementation.
 * It defines an interface that a device specific implementation must support.
*/
export interface StorageAdapter {
  /**
   * Creates an instance of the StorageAdapter in transaction mode
   */
  createTransaction(): Promise<StorageAdapter>;

  /**
   * Commits current active transaction to db
   * @throws Will throw if @this is not a transaction
   */
  commit(): Promise<void>;

  /**
   * Rollback current active transaction
   * @throws Will throw if @this is not a transaction
   */
  rollback(): Promise<void>;

  /**
   * @returns true if @this is an active transaction
   */
  isTransactionOpen(): boolean;

  /**
   * Create a new Store with the given config
   *
   * @param config
   */
  addStore(config: ModelSchema): void;


  /**
   * Create a new Stores with the given config
   */
  createStores(): void;

  /**
   * Saves data to the Store
   *
   * @param storeName The name of the store
   * @param input The data to be saved
   * @returns A Promise of the saved data
   */
  save(storeName: string, input: any): Promise<any>;

  /**
   * Queries data from the store matching the filter.
   * Returns all the data if filter is not specified
   *
   * @param storeName The name of the store
   * @param fliter
   * @returns A Promise of the query results
   */
  query(storeName: string, filter?: Filter): Promise<any | any[]>;

  queryById(storeName: string, id: string): Promise<any>;

  /**
   * Update data matching filter or all data if filter is not specified
   * with input.
   *
   * @param storeName The name of the store
   * @param input The update to be made
   * @param filter
   * @returns A Promise of the updated data
   */
  update(storeName: string, input: any, filter?: Filter): Promise<any[]>;

  updateById(storeName: string, input: any, id: string): Promise<any>;

  /**
   * Tries to update @param input in @param storeName
   * If no document exists with the given primary key exists,
   * @param input is saved to @param storeName
   */
  saveOrUpdate(storeName: string, input: any): Promise<any>;

  /**
   * Deletes data matching filter or all from the store
   *
   * @param storeName The name of the store
   * @param filter
   * @returns A Promise of the deleted data
   */
  remove(storeName: string, filter?: Filter): Promise<any[]>;

  removeById(storeName: string, id: string): Promise<any>;
}
