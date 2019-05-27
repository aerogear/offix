import { MutationOptions, OperationVariables, MutationUpdaterFn } from "apollo-client";
import { DocumentNode } from "graphql";
import { CacheOperation } from "./CacheOperation";
import { createOptimisticResponse } from "./createOptimisticResponse";
import { Query } from "./CacheUpdates";
import { getOperationFieldName, deconstructQuery } from "../utils/helpers";
import { isArray } from "util";

export interface MutationHelperOptions {
  mutation: DocumentNode;
  variables: OperationVariables;
  updateQuery: Query | Query[];
  typeName: string;
  operationType?: CacheOperation;
  idField?: string;
}

export const createMutationOptions = (options: MutationHelperOptions): MutationOptions => {
  const {
    mutation,
    variables,
    updateQuery,
    typeName,
    operationType = CacheOperation.ADD,
    idField = "id"
  } = options;
  const operationName = getOperationFieldName(mutation);
  const optimisticResponse = createOptimisticResponse({
    mutation,
    variables,
    updateQuery,
    operationType,
    idField,
    typeName
  });

  const update: MutationUpdaterFn = (cache, { data }) => {
    if (isArray(updateQuery)) {
      for (const query of updateQuery) {
        const updateFunction = getUpdateFunction(operationName, idField, query, operationType);
        updateFunction(cache, { data });
      }
    } else {
      const updateFunction = getUpdateFunction(operationName, idField, updateQuery, operationType);
      updateFunction(cache, { data });
    }
  };

  return { mutation, variables, optimisticResponse, update };
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
  updateQuery: Query,
  opType: CacheOperation): MutationUpdaterFn => {

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
              const newData = queryResult[queryField].filter((item: any) => {
                return operationData[idField] !== item[idField];
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
