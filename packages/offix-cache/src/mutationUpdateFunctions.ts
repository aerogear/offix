import { MutationUpdaterFn, OperationVariables } from "apollo-client";
import { CacheOperation } from "./api/CacheOperation";
import { CacheUpdatesQuery } from "./api/CacheUpdates";
import { getOperationFieldName, deconstructQuery } from "./utils/helperFunctions";

/**
 * Options that are passed to the generic cache update helper functions
 */
export interface CacheUpdateHelperOptions {
  /**
   * Key used to access mutation result.
   * For example for `modifyObject(value: String!)` mutation it will be `modifyObject`
   */
  mutationName: string;

  /**
   * GraphQL query we want to update
   */
  updateQuery: CacheUpdatesQuery;

  /**
   * String value for the id field for particular object.
   *
   * @default uses `id` field on the type
   */
  idField?: string;
}

/**
 * Set of parameters used to generate the update function to
 * update the cache for a given operation and query.
 */
export interface CacheUpdateOptions extends CacheUpdateHelperOptions{
  /**
   * Defines operation type used to make appropriate changes in cache
   *
   * @default CacheOperation.ADD
   */
  operationType?: CacheOperation;
}

/**
 * Generate the update function to update the cache for a given operation and query.
 **/
export const getUpdateFunction = (options: CacheUpdateOptions): MutationUpdaterFn => {
  if (!options.updateQuery) {
    throw new Error("Required updateQuery parameter is not supplied");
  }
  if (!options.mutationName) {
    throw new Error("Required mutationName parameter is not supplied");
  }

  const { operationType = CacheOperation.ADD, ...cacheHelperOptions } = options

  if (operationType === CacheOperation.ADD) {
   return addItemToQuery(cacheHelperOptions);
  } 
  if (operationType === CacheOperation.DELETE) {
    return deleteItemFromQuery(cacheHelperOptions);
  } 
  // this default catches the REFRESH case and returns an empty update function which does nothing
  return () => {};
};

function addItemToQuery({ mutationName, updateQuery, idField = "id" }: CacheUpdateHelperOptions): MutationUpdaterFn {
  return (cache, { data }) => {
    const { query, variables } = deconstructQuery(updateQuery);
    const queryField = getOperationFieldName(query);
    let queryResult;
    if (data) {
      const operationData = data[mutationName];
      try {
        queryResult = cache.readQuery({ query, variables }) as any;
      } catch (e) {
        queryResult = {};
      }

      const result = queryResult[queryField];
      if (result && operationData) {
        // FIXME deduplication should happen on subscriptions
        // We do that every time no matter if we have subscription
        if (!result.find((item: any) => {
          return item[idField] === operationData[idField];
        })) {
          result.push(operationData);
        }
      } else {
        queryResult[queryField] = [operationData];
      }
      try {
        cache.writeQuery({
          query,
          variables,
          data: queryResult
        });
        // tslint:disable-next-line: no-empty
      } finally {
      }
    }
  };
}

function deleteItemFromQuery({ mutationName, updateQuery, idField = "id" }: CacheUpdateHelperOptions): MutationUpdaterFn {
  return (cache, { data }) => {
    const { query, variables } = deconstructQuery(updateQuery);
    const queryField = getOperationFieldName(query);
    if (data) {
      try {
        const queryResult = cache.readQuery({ query, variables }) as any;
        const operationData = data[mutationName];
        if (operationData) {
          let toBeRemoved = {} as any;
          if (typeof operationData === "string") {
            toBeRemoved[idField] = operationData;
          } else {
            toBeRemoved = operationData;
          }
          const newData = queryResult[queryField].filter((item: any) => {
            return toBeRemoved[idField] !== item[idField];
          });
          queryResult[queryField] = newData;
          cache.writeQuery({
            query,
            variables,
            data: queryResult
          });
        }
        // tslint:disable-next-line: no-empty
      } finally {
      }
    }
  };
}