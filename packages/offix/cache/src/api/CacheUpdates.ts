
import { MutationUpdaterFn, OperationVariables } from "apollo-client";
import { DocumentNode } from "graphql";

/**
 * Interface map mutation names to their respective update functions.
 * Developers can write cache updates for individual views
 * in form of object with keys referencing mutation names that are being used.
 *
 * For example:
 *
 * const taskUpdates =  {
 *  createTask: () => {...}
 * }
 */
export interface CacheUpdates {
  [key: string]: MutationUpdaterFn;
}

/**
 * Definition of function used for subscribeToMore cache updates
 */
export type SubscribeToMoreUpdateFunction = (array: [CacheItem], newItem?: CacheItem) => CacheItem[];

export interface CacheItem {
  [key: string]: any;
}

export interface QueryWithVariables {
  query: DocumentNode;
  variables?: OperationVariables;
}

/**
 * Defines query with variables or single query as DocumentNode
 */
export type CacheUpdatesQuery = QueryWithVariables | DocumentNode;
