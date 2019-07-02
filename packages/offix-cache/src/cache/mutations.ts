import { MutationOptions, MutationUpdaterFn } from "apollo-client";
import { CacheOperation } from "./CacheOperation";
import { createOptimisticResponse } from "../optimisticResponse";
import { Query } from "./CacheUpdates";
import { getOperationFieldName, deconstructQuery } from "../utils/helperFunctions";
import { isArray } from "util";

export interface Context {
  conflictBase?: any;
  returnType?: string;
}

export interface MutationHelperOptions extends MutationOptions {
  updateQuery?: Query | Query[];
  operationType?: CacheOperation;
  context: Context | any;
  idField?: string;
  returnType?: string;
}

/**
 * Creates a MutationOptions object which can be used with Apollo Client's mutate function
 * Provides useful helpers for cache updates, optimistic responses, and context
 * @param options see `MutationHelperOptions`
 */
export const createMutationOptions = (options: MutationHelperOptions): MutationOptions => {
  const {
    mutation,
    variables,
    updateQuery,
    returnType,
    operationType = CacheOperation.ADD,
    idField = "id",
    context
  } = options;
  const operationName = getOperationFieldName(mutation);
  if (returnType && !options.optimisticResponse) {
    options.optimisticResponse = createOptimisticResponse({
      mutation,
      variables,
      returnType,
      operationType,
      idField
    });
  }

  const update: MutationUpdaterFn = (cache, { data }) => {
    if (isArray(updateQuery)) {
      for (const query of updateQuery) {
        const updateFunction = getUpdateFunction(operationName, idField, operationType, query);
        updateFunction(cache, { data });
      }
    } else {
      const updateFunction = getUpdateFunction(operationName, idField, operationType, updateQuery);
      updateFunction(cache, { data });
    }
  };
  return { ...options, update, context: {...context, returnType} };
};

/**
 * Generate the update function to update the cache for a given operation and query.
 * Ignores the scenario where the cache operation is an update as this is handled automatically
 * from Apollo Client 2.5 onwards.
 * @param operation The title of the operation being performed
 * @param idField The id field the item keys off
 * @param updateQuery The Query to update in the cache
 * @param opType The type of operation being performed
 */
export const getUpdateFunction = (
  operation: string,
  idField: string,
  opType: CacheOperation,
  updateQuery?: Query): MutationUpdaterFn => {

  if (!updateQuery) {
    return () => {
        return;
      };
  }

  const { query, variables } = deconstructQuery(updateQuery);
  const queryField = getOperationFieldName(query);

  let updateFunction: MutationUpdaterFn;

  switch (opType) {
    case CacheOperation.ADD:
      updateFunction = (cache, { data }) => {
        try {
          if (data) {
            let queryResult = cache.readQuery({ query, variables }) as any;
            const operationData = data[operation];
            const result = queryResult[queryField];
            if (result && operationData) {
              if (!result.find((item: any) => {
                return item[idField] === operationData[idField];
              })) {
                result.push(operationData);
              }
            } else {
              queryResult = [result];
            }
            cache.writeQuery({
              query,
              variables,
              data: queryResult
            });
          }
        } catch (e) {
          console.info(e);
        }
      };
      break;
    case CacheOperation.DELETE:
      updateFunction = (cache, { data }) => {
        try {
          if (data) {
            const queryResult = cache.readQuery({ query, variables }) as any;
            const operationData = data[operation];
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
          }
        } catch (e) {
          console.info(e);
        }
      };
      break;
    default:
      updateFunction = () => {
        return;
      };
  }
  return updateFunction;
};
