import { MutationOptions, MutationUpdaterFn, OperationVariables } from "apollo-client";
import { CacheOperation } from "./CacheOperation";
import { createOptimisticResponse } from "../optimisticResponse";
import { CacheUpdatesQuery } from "./CacheUpdates";
import { getOperationFieldName, deconstructQuery } from "../utils/helperFunctions";
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
 * Set of parameters used to generate the update function to
 * update the cache for a given operation and query.
 */
export interface CacheUpdateOptions {
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
   * Defines operation type used to make appropriate changes in cache
   *
   * @default CacheOperation.ADD
   */
  operationType?: CacheOperation;

  /**
   * String value for the id field for particular object.
   *
   * @default uses `id` field on the type
   */
  idField?: string;
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
  const {
    mutationName,
    updateQuery,
    operationType = CacheOperation.ADD,
    idField = "id"
  } = options;

  const { query, variables } = deconstructQuery(updateQuery);
  const queryName = getOperationFieldName(query);
  let updateFunction: MutationUpdaterFn;
  if (operationType === CacheOperation.ADD) {
    updateFunction = (cache, { data }) => {
      let queryResult;
      if (data) {
        const operationData = data[mutationName];
        try {
          queryResult = cache.readQuery({ query, variables }) as any;
        } catch (e) {
          queryResult = {};
        }

        let result = queryResult[queryName];
        if (result && operationData) {
          // FIXME deduplication should happen on subscriptions
          // We do that every time no matter if we have subscription
          if (!result.find((item: any) => {
            return item[idField] === operationData[idField];
          })) {
            result = result.concat(operationData);
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

  } else if (operationType === CacheOperation.DELETE) {
    updateFunction = (cache, { data }) => {
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
  } else {
    // this default catches the REFRESH case and returns an empty update function which does nothing
    updateFunction = () => {
      return;
    };
  }

  return updateFunction;
};
