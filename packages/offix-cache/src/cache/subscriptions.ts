import { SubscribeToMoreOptions, OperationVariables, ObservableQuery } from "apollo-client";
import { QueryWithVariables, UpdateFunction, Query } from "./CacheUpdates";
import { DocumentNode } from "graphql";
import { CacheOperation } from "./CacheOperation";
import { getOperationFieldName } from "..";

export interface SubscriptionHelperOptions {
  subscriptionQuery: Query;
  cacheUpdateQuery: Query;
  operationType: CacheOperation;
  idField?: string;
}

/**
 * Helper function which can be used to call subscribeToMore for multiple SubscriptionHelperOptions
 * @param observableQuery the query which you would like to call subscribeToMore on.
 * @param arrayOfHelperOptions the array of `SubscriptionHelperOptions`
 */
export const subscribeToMoreHelper = (observableQuery: ObservableQuery,
                                      arrayOfHelperOptions: SubscriptionHelperOptions[]) => {
  for (const option of arrayOfHelperOptions) {
    observableQuery.subscribeToMore(createSubscriptionOptions(option));
  }
};

/**
 * Creates a SubscribeToMoreOptions object which can be used with Apollo Client's subscribeToMore function
 * on an observable query.
 * @param options see `SubscriptionHelperOptions`
 */
export const createSubscriptionOptions = (options: SubscriptionHelperOptions): SubscribeToMoreOptions => {
  const {
    subscriptionQuery,
    cacheUpdateQuery,
    operationType,
    idField = "id"
  } = options;
  const document = (subscriptionQuery && (subscriptionQuery as QueryWithVariables).query)
    || (subscriptionQuery as DocumentNode);
  const variables = (subscriptionQuery && (subscriptionQuery as QueryWithVariables).variables)
    || {} as OperationVariables;
  const query = (cacheUpdateQuery && (cacheUpdateQuery as QueryWithVariables).query)
    || (cacheUpdateQuery as DocumentNode);
  const queryField = getOperationFieldName(query);

  return {
    document,
    variables,
    updateQuery: (prev, { subscriptionData }) => {
      const data = subscriptionData.data;
      const [key] = Object.keys(data);
      const mutadedItem = data[key];

      const optype = operationType;
      const obj = prev[queryField];

      const updater = getUpdateQueryFunction(optype, idField);
      const result = updater(obj, mutadedItem);
      return {
        [queryField]: result
      };
    }
  };
};

/**
 * Generate the standard update function to update the cache for a given operation type and query.
 * @param opType The type of operation being performed
 * @param idField The id field the item keys off
 */
export const getUpdateQueryFunction = (opType: CacheOperation, idField = "id"): UpdateFunction => {
  let updateFunction: UpdateFunction;

  switch (opType) {
    case CacheOperation.ADD:
      updateFunction = (prev, newItem) => {
        if (!newItem) {
          return [...prev];
        } else {
          return [...prev.filter(item => {
            return item[idField] !== newItem[idField];
          }), newItem];
        }
      };
      break;
    case CacheOperation.REFRESH:
      updateFunction = (prev, newItem) => {
        if (!newItem) {
          return [...prev];
        } else {
          return prev.map((item: any) => item[idField] === newItem[idField] ? newItem : item);
        }
      };
      break;
    case CacheOperation.DELETE:
      updateFunction = (prev, newItem) => {
        if (!newItem) {
          return [];
        } else {
          return prev.filter((item: any) => item[idField] !== newItem[idField]);
        }
      };
      break;
    default:
      updateFunction = prev => prev;
  }

  return updateFunction;
};
