import { PredicateFunction } from "../../predicates";
import { CRUDEvents } from "./CRUDEvents";

/**
 * This interface defines the API that is required
 * from any device specific storage implementation.
 * It defines a CRUD interface that a
 * device specific implementation must support.
*/
export interface StorageAdapter {
  /**
   * Saves data to the Store
   *
   * @param storeName The name of the store
   * @param input The data to be saved
   * @returns A Promise of the saved data
   */
  save(storeName: string, input: any): Promise<any>;

  /**
   * Queries data from the store matching the predicate.
   * Returns all the data if predicate is not specified
   *
   * @param storeName The name of the store
   * @param predicate A PredicateFunction to filter data
   * @returns A Promise of the query results
   */
  query(storeName: string, predicate?: PredicateFunction): Promise<any | any[]>;

  /**
   * Update data matching predicate or all data if predicate is not specified
   * with input.
   *
   * @param storeName The name of the store
   * @param input The update to be made
   * @param predicate A PredicateFunction to filter data
   * @returns A Promise of the updated data
   */
  update(storeName: string, input: any, predicate?: PredicateFunction): Promise<any>;

  /**
   * Deletes data matching predicate or all from the store
   *
   * @param storeName The name of the store
   * @param predicate A PredicateFunction to filter data
   * @returns A Promise of the deleted data
   */
  remove(storeName: string, predicate?: PredicateFunction): Promise<any | any[]>;
}

/**
 * StoreChangeEvent is an event emitted whenever
 * a change has occurred on the local store
*/
export interface StoreChangeEvent {
  /**
   * The type of change event that just occurred
   */
  eventType: CRUDEvents;

  /**
   * The data that was affected by the change
   */
  data: any;

  /**
   * The name store that was changed
   */
  storeName: string;
}
