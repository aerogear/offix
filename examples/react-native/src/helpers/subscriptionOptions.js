import { createSubscriptionOptions } from 'offix-client';
import { CacheOperation } from 'offix-cache';
import {
  GET_TODOS,
  TODO_ADDED_SUBSCRIPTION,
  TODO_UPDATED_SUBSCRIPTION,
  TODO_DELETED_SUBSCRIPTION,
} from '../gql/queries';

// use offix-client helpers to create the required
// subscription options for an `add` event
export const add = createSubscriptionOptions({
  subscriptionQuery: TODO_ADDED_SUBSCRIPTION,
  cacheUpdateQuery: GET_TODOS,
  operationType: CacheOperation.ADD,
});

// use offix-client helpers to create the required
// subscription options for an `update` event
export const edit = createSubscriptionOptions({
  subscriptionQuery: TODO_UPDATED_SUBSCRIPTION,
  cacheUpdateQuery: GET_TODOS,
  operationType: CacheOperation.REFRESH,
});

// Custom options for delete subscription event
// since offix expects the return type to
// be the full object on not id only
export const remove = {
  document: TODO_DELETED_SUBSCRIPTION,
  updateQuery: (prev, { subscriptionData }) => {
    if (!subscriptionData.data) return prev;

    const { data } = subscriptionData;

    // get the object key for the todo list
    // in this case `findAllTodos`
    const [queryField] = Object.keys(prev);

    // get the object key for the mutated
    // item, in this case `deletedTodo`
    const [key] = Object.keys(data);

    // Get the `prev` object and replace
    // the `findAllTodos` array with
    // filtered todo list
    return {
      ...prev,
      [queryField]: prev[queryField].filter((todo) => todo.id !== data[key]),
    };
  },
};
