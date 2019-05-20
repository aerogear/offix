
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

export type UpdateFunction = (array: [CacheItem], newItem?: CacheItem) => CacheItem[];

export interface CacheItem {
  [key: string]: any;
}

export interface QueryWithVariables {
  query: DocumentNode;
  variables?: OperationVariables;
}

export type Query = QueryWithVariables | DocumentNode;
