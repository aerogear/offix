---
id: offix-cache
title: Offix Cache
sidebar_label: Client Cache
---

The `offix-cache` package helps developers to manage some of their client's state such as cache, optimistic responses and subscriptions.

Offix Cache capabilities are available automatically when using `client.offlineMutate`.

## Optimistic UI

In Apollo Client, mutation results are not applied to the UI until responses are received from the server. To provide a better user experience, an application may want to update the UI immediately. [Optimistic Responses](https://www.apollographql.com/docs/react/api/react-apollo.html#graphql-mutation-options-optimisticResponse 'Optimistic Responses') are an easy to way to achieve this goal. However, creating individual optimistic responses for each mutation in your application can introduce boilerplate code. offix-cache can automatically create optimistic responses for you to reduce this boilerplate.

The `createOptimisticResponse` function returns an object which can be passed directly to Apollo Client's mutate function. `createOptimisticResponse` will help to build expected response object from input arguments.
if your mutation returns different values you will still need to build it manually.

```javascript
import { createOptimisticResponse } from 'offix-cache';

const optimisticResponse = createOptimisticResponse({
  mutation: ADD_TASK,
  variables: { some_key: 'some_value' },
  operationType: 'add',
  returnType: 'Task',
  idField: 'id'
});

apolloClient.mutate({
  mutation: ADD_TASK,
  optimisticResponse: optimisticResponse
});
```

## Mutation Cache Helpers

`offix-cache` provides a mechanism to automatically update the client cache based on the result returned by a mutation. The `createMutationOptions` function returns a `MutationOptions` object compatible with Apollo Client's mutate.

```javascript
const { createMutationOptions, CacheOperation } = require('offix-cache');

const mutationOptions = {
  mutation: ADD_TASK,
  variables: {
    title: 'item title'
  },
  updateQuery: {
    query: GET_TASKS,
    variables: {
      filterBy: 'some filter'
    }
  },
  returnType: 'Task',
  operationType: CacheOperation.ADD,
  idField: 'id'
};
```

We can also provide more than one query to update in the cache by providing an array to the `updateQuery` parameter:

```javascript
const mutationOptions = {
  ...
  updateQuery: [
    { query: GET_TASKS, variables: {} }
  ],
  ...
};
```

Where `mutationOptions` is either of the two objects shown above, we can then pass this object to our mutate function.

```javascript
const options = createMutationOptions(mutationOptions);

apolloClient.mutate(options);
```

> NOTE: Cache helpers currently support only GraphQL Queries that return arrays.
> For example `getUsers():[User]`.
> When working with single objects returned by Queries we usually do not need use any helper as Query will be updated automatically on every update

## Subscription Helpers

`offix-cache` provides a subscription cache update method helper which can generate the necessary options to be used with Apollo Client's `subscribeToMore` function.

To use this helper, we first need to create some options. These options should take the folowing form:

```javascript
const { CacheOperation } = require('offix-cache');

const options = {
  subscriptionQuery: TASK_ADDED_SUBSCRIPTION,
  cacheUpdateQuery: GET_TASKS,
  operationType: CacheOperation.ADD
};
```

This options object will be used to inform the subscription helper that for every data object received because of the `TASK_ADDED_SUBSCRIPTION` the `GET_TASKS` query should also be kept up to date in the cache.

We can then create the required cache update functions in the following way:

```javascript
const { createSubscriptionOptions } = require('offix-cache');

const subscriptionOptions = createSubscriptionOptions(options);
```

To use this helper we then pass this `subscriptionOptions` variable to the `subscribeToMore` function of our `ObservableQuery`.

```javascript
const query =
  apolloClient.watchQuery <
  AllTasks >
  {
    query: GET_TASKS
  };

query.subscribeToMore(subscriptionOptions);
```

The cache will now be kept up to date with automatic data deduplication being performed.

### Multiple Subscriptions

`offix-cache` also provides the ability to automatically call `subscribeToMore` on your `ObservableQuery`. This can be useful in a situation where you may have multiple subscriptions which can affect one single query. For example, if you have a `TaskAdded`, `TaskDeleted` and a `TaskUpdated` subscription you would need three separate `subscribeToMore` function calls. This can become tedious as your number of subscriptions grow. To combat this, we can use the `subscribeToMoreHelper` function from offix-cache to automatically handle this for us by passing it an array of subscriptions and their corresponding queries which need to be updated.

```javascript
const { CacheOperation } = require('offix-cache');

const addOptions = {
  subscriptionQuery: TASK_ADDED_SUBSCRIPTION,
  cacheUpdateQuery: GET_TASKS,
  operationType: CacheOperation.ADD
};

const deleteOptions = {
  subscriptionQuery: TASK_DELETED_SUBSCRIPTION,
  cacheUpdateQuery: GET_TASKS,
  operationType: CacheOperation.DELETE
};

const updateOptions = {
  subscriptionQuery: TASK_UPDATED_SUBSCRIPTION,
  cacheUpdateQuery: GET_TASKS,
  operationType: CacheOperation.REFRESH
};

const query =
  client.watchQuery <
  AllTasks >
  {
    query: GET_TASKS
  };

subscribeToMoreHelper(query, [addOptions, deleteOptions, updateOptions]);
```
