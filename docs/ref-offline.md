---
id: offline-client
title: Offline Support
sidebar_label: Offline Client
---

Offix provides first class support for performing GraphQL operations while offline. Mutations are held in a queue that is configured to hold requests while the client is offline. When the client goes offline for long periods of time they will still be able negotiate local updates with the server state thanks to powerful conflict resolution strategies.

Offix-client offers a comprehensive set of features to perform data operations when offline. Thanks to the offline mutation store users can stage their changes to be replicated back to the server when they return online.

Please follow chapters bellow for more information.

## Querying local cache

By default queries are cached based on the type and id field, and the results of performed queries are cached as well and they will be available when the client is offline.

Because of this, when mutations that can change query results are performed, the `refetchQueries` or update options of the mutate method should be used to ensure the local cache is kept up to date.

Offix makes your cache simple to manage, with out of the box cache helpers in `offix-cache` or by automatically wrapping these helpers in offix-client through the `OfflineClient` class.

To use the `offlineMutate` function, we first need to create our `MutationHelperOptions` object. This is an extension of Apollo's MutationOptions.

```javascript
const { CacheOperation } = require('offix-cache');

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
  ]
  ,
  ...
};
```

We then simply pass this object to `offlineMutate` and our cache is automatically kept up to date.

```javascript
client.offlineMutate(mutationOptions);
```

If you do not wish to use offline capabilities of the offix for some of the mutations please use an `client.mutate` function . This function will not react to the changes in network state. Your requests will not be enqueued into offline queue.

## Offline Workflow

When offline `client.offlineMutate` function will return immediately after is called.
Returned promise will resolve into error (`catch` method is triggered).
Developers can detect if error is an offline error and watch for change to be replicated back to server.

Example:

```javascript
client.offlineMutate(...).catch((error)=> {
  // 1. Detect if this was an offline error
  if (error.offline){
    // 2. We can still track when offline change is going to be replicated.
    error.watchOfflineChange().then(...)
  }
});
```

> Note: Additionally to watching individual mutations framework offers global offline listener that can be supplied when creating client.

## Global Update Functions

Apollo client holds all mutation parameters in memory. An offline Apollo client will continue to store mutation parameters and once online, it will restore all mutations to memory. Any Update Functions that are supplied to mutations cannot be cached by an Apollo client resulting in the loss of all optimisticResponses after a restart. Update functions supplied to mutations cannot be saved in the cache. As a result, all optimisticResponses will disappear from the application after a restart and it will only reappear when the Apollo client becomes online and successfully syncs with the server.

To prevent the loss of all optimisticResponses after a restart, you can configure the Update Functions to restore all optimisticResponses.

```javascript
const updateFunctions = {
  // Can contain update functions from each component
  ...ItemUpdates,
  ...TasksUpdates
};

let config = {
  mutationCacheUpdates: updateFunctions
};
```

## Making modifications when offline

Client provides queue that stores mutations performed when offline.
By default queue saves data in storage to be available after application restarts.
Queue will hold requests until application will come back online.

Developers can adjust how queue will process new mutations by supplying custom `NetworkStatus` implementation.

## Listening for Events

It is possible to provide `offlineQueueListener` in config to be notified about offline related events:

```javascript
client.registerOfflineEventListener({
  onOperationEnqueued(operation) {
    // called when operation was placed on the queue
  },
  onOperationFailure: (operation) => {
    // called when the operation failed
  },
  onOperationSuccess: (operation) => {
    // called when the operation was fulfilled
  },
  onOperationRequeued: (operation) => {
    // called when an operation was loaded in from storage and placed back on the queue
    // This would happen across app restarts
  },
  queueCleared() {
    // called when all operations are fulfilled and the queue is cleared
  }
});
```

Below is an example `ApolloQueueEntryOperation` object.

```js
{
  qid: 'client:abc123'
  op: { 
    context: {
      operationName: 'createItem',
      conflictBase: undefined,
      idField: 'id',
      returnType: 'Item'
    },
    mutation: <mutation object parsed by gql>,
    optimisticResponse: <optimistic response object>,
    variables: <mutation variables>
  }
}
```

`ApolloQueueEntryOperation` objects have two top level fields:

* `qid` - Queue ID. This ID is randomly generated and mostly used by the `OfflineQueue`.
* `op` - The operation. In `offix-client` It's of type `MutationOptions`, the options object passed into `client.offlineMutate` with some extra metadata set by `offix-client`.

## Cache

Apollo Offline Client strongly leverages Apollo Cache.
Please follow documentation for more information about caching in Apollo GraphQL

https://www.apollographql.com/docs/react/advanced/caching.html

### Querying your data

Cache is used to hold data that can be fetched when client is offline.
To effectively work with cache users can use `cache-first` fetchPolicy
when performing queries. This policy will try to use local cache in
situations when cache was already populated with the server side data.

```javascript
return (
  this.apollo.watchQuery <
  YourType >
  {
    query: YOUR_QUERY,
    fetchPolicy: 'cache-first'
  }
);
```

Cache is going to be refueled by subscriptions, pooling or regular queries happening in UI.

## Designing your types

When designing your GraphQL schema types `id` field will be always required.
We also expect that id will be always queried back from server.
Library will perform business logic assuming that `id` field will be supplied and returned from server. Without this field some offline functionalities will not work properly.
