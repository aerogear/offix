import { MutationOptions, MutationUpdaterFn, OperationVariables } from "apollo-client";
import { CacheOperation } from "./api/CacheOperation";
import { createOptimisticResponse } from "./optimisticResponse";
import { CacheUpdatesQuery } from "./api/CacheUpdates";
import { getOperationFieldName, deconstructQuery } from "./utils/helperFunctions";
import { isArray } from "util";

/**
 * Interface to overlay helper internals on top of mutation options.
 */
export interface MutationHelperOptions<T = {
  [key: string]: any;
}, TVariables = OperationVariables> extends MutationOptions<T, TVariables> {
  /**
   * Query or many queries we want to update
   */
  updateQuery?: CacheUpdatesQuery | CacheUpdatesQuery[];
  /**
   * Defines operation type used to make appropriate changes in cache
   *
   * @default CacheOperation.ADD will append object to existing array of objects
   */
  operationType?: CacheOperation;

  /**
   * String value for the id field for particular object.
   *
   * @default `id` field on the type
   */
  idField?: string;

  /**
   * Mutation return type
   * For example for `modifyObject(value: String!): Object` value will be `Object`
   */
  returnType?: string;
}

/**
 * Creates a MutationOptions object which can be used with Apollo Client's mutate function
 * Provides useful helpers for cache updates, optimistic responses, and context
 * @param options see `MutationHelperOptions`
 */
export const createMutationOptions = <T = {
  [key: string]: any;
}, TVariables = OperationVariables>(options: MutationHelperOptions<T, TVariables>):
  MutationOptions<T, TVariables> => {
  const {
    mutation,
    variables,
    updateQuery,
    returnType,
    operationType = CacheOperation.ADD,
    idField = "id",
    context
  } = options;

  if (returnType && !options.optimisticResponse) {
    options.optimisticResponse = createOptimisticResponse({
      mutation,
      variables,
      returnType,
      operationType,
      idField
    });
  }

  const mutationName = getOperationFieldName(mutation);
  if (updateQuery) {
    const update: MutationUpdaterFn = (cache, { data }) => {
      if (isArray(updateQuery)) {
        for (const query of updateQuery) {
          const updateFunction = getUpdateFunction({
            mutationName,
            idField,
            operationType,
            updateQuery: query
          });
          updateFunction(cache, { data });
        }
      } else {
        const updateFunction = getUpdateFunction({
          mutationName,
          idField,
          operationType,
          updateQuery
        });
        updateFunction(cache, { data });
      }
    };
    options.update = update;
  }

  options.context = { ...context, returnType, idField, operationName: mutationName, isOffline: true };
  return options;
};


