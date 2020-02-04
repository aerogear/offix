import { SubscribeToMoreOptions, OperationVariables, ObservableQuery } from "apollo-client";
import { QueryWithVariables, CacheUpdatesQuery, SubscribeToMoreUpdateFunction } from "./api/CacheUpdates";
import { DocumentNode } from "graphql";
import { CacheOperation } from "./api/CacheOperation";
import { CacheItem } from "./api/CacheUpdates"
import { getOperationFieldName } from ".";

export interface SubscriptionHelperOptions {
  subscriptionQuery: CacheUpdatesQuery;
  cacheUpdateQuery: CacheUpdatesQuery;
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
 * @param operationType The type of operation being performed
 * @param idField The id field the item keys off
 */
const getUpdateQueryFunction = (operationType: CacheOperation, idField = "id"): SubscribeToMoreUpdateFunction => {
  if (operationType === CacheOperation.ADD) {
    return addSubscriptionItem({ idField })
  }
  if (operationType === CacheOperation.REFRESH) {
    return updateSubscriptionItem({ idField })
  }
  if (operationType === CacheOperation.DELETE) {
    return deleteSubscriptionItem({ idField })
  }
  // return a default function that does nothing
  return (prev) => { return prev }
};


/**
 * returns a generic updateQuery function used to add a new item to a previous list of items.
 * may be exported in the future
 */
function addSubscriptionItem({ idField }: { idField: string }) {
  return (prev: [CacheItem], newItem: CacheItem | undefined) => {
    if (!newItem) {
      return [...prev];
    } else {
      return [...prev.filter(item => {
        return item[idField] !== newItem[idField];
      }), newItem];
    }
  }
};

/**
 * returns a generic updateQuery function used to delete an item from a previous list of items.
 * may be exported in the future
 */
function deleteSubscriptionItem({ idField }: { idField: string }) {
  return (prev: [CacheItem], newItem: CacheItem | undefined) => {
    if (!newItem) {
      return [];
    } else {
      return prev.filter((item: any) => item[idField] !== newItem[idField]);
    }
  };
};

/**
 * returns a generic updateQuery function used to update an item in a previous list of items.
 * may be exported in the future
 */
function updateSubscriptionItem({ idField }: { idField: string }) {
  return (prev: [CacheItem], newItem: CacheItem | undefined) => {
    if (!newItem) {
      return [...prev];
    } else {
      return prev.map((item: any) => item[idField] === newItem[idField] ? newItem : item);
    }
  }
};
