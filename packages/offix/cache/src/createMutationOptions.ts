import { MutationOptions, MutationUpdaterFn, OperationVariables } from "apollo-client";
import { CacheOperation } from "./api/CacheOperation";
import { createOptimisticResponse } from "./createOptimisticResponse";
import { CacheUpdatesQuery } from "./api/CacheUpdates";
import { getOperationFieldName, deconstructQuery } from "./utils/helperFunctions";

export interface InputMapper {
  deserialize: (object: any) => any;
  serialize: (object: any) => any;
}

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

  /**
   * [Modifier]
   *
   * Maps input objects for the cases if variables are not passed to the root
   *
   */
  inputMapper?: InputMapper;
}

/**
 * Options that are passed to the generic cache update helper functions
 */
interface CacheUpdateHelperOptions {
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

  /**
   * String value for possible nested return type, primarily used
   * with pagination or relationships.
   *
   * @default uses null
   */
  returnField?: string | null;
}

/**
 * Set of parameters used to generate the update function to
 * update the cache for a given operation and query.
 */
interface CacheUpdateOptions extends CacheUpdateHelperOptions {
  /**
   * Defines operation type used to make appropriate changes in cache
   *
   * @default CacheOperation.ADD
   */
  operationType?: CacheOperation;
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
    context,
    inputMapper
  } = options;

  if (returnType && !options.optimisticResponse) {
    options.optimisticResponse = createOptimisticResponse({
      mutation,
      variables,
      returnType,
      operationType,
      idField,
      inputMapper
    });
  }

  const mutationName = getOperationFieldName(mutation);
  if (updateQuery) {
    const update: MutationUpdaterFn = (cache, { data }) => {
      if (Array.isArray(updateQuery)) {
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

  const { operationType = CacheOperation.ADD, ...cacheHelperOptions } = options;

  if (operationType === CacheOperation.ADD) {
    return addItemToQuery(cacheHelperOptions);
  }
  if (operationType === CacheOperation.DELETE) {
    return deleteItemFromQuery(cacheHelperOptions);
  }
  // this default catches the REFRESH case and returns an empty update function which does nothing
  // eslint-disable-next-line
  return () => { };
};

/**
 * Generic cache update function that adds an item to a query that contains a list of items
 * Might be exported in the future
 */
function addItemToQuery({ mutationName, updateQuery, idField = "id", returnField = null }: CacheUpdateHelperOptions): MutationUpdaterFn {
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

      const result = (returnField)
        ? queryResult[queryField][returnField]
        : queryResult[queryField];

      if (result && operationData) {
        // FIXME deduplication should happen on subscriptions
        // We do that every time no matter if we have subscription
        if (result instanceof Array) {
          const foundItem = !result.find((item: any) => {
            return item[idField] === operationData[idField];
          });
          if (foundItem) {
            result.push(operationData);
          }
        }
      } else {
        if (!returnField) {
          queryResult[queryField] = [operationData];
        } else {
          queryResult[queryField][returnField] = [operationData];
        }
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

/**
 * Generic cache update function that removes an item from a query that contains a list of items
 * Might be exported in the future
 */
function deleteItemFromQuery({ mutationName, updateQuery, idField = "id", returnField = null }: CacheUpdateHelperOptions): MutationUpdaterFn {
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
          let newData: any;

          const prev = (returnField)
            ? queryResult[queryField][returnField]
            : queryResult[queryField];

          if (prev instanceof Array) {
            newData = prev.filter((item: any) => {
              return toBeRemoved[idField] !== item[idField];
            });
          } else {
            if (!returnField) {
              newData = queryResult[queryField];
            } else {
              newData = queryResult[queryField][returnField];
            }
          }

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
