---
layout: page
title: Apollo Offline Client
navigation: 3
---

# Offline support

SDK provides first class support for performing GraphQL operations while offline.
Queries and mutations are hold in queue that is being configured to hold requests when client goes offline.
When client goes offline for long periods of time clients will be able still negotiate local updates with the server state thanks to powerful conflict resolution strategies.


Client offers comprehensive set of features to perform data operations when offline.
Thanks to offline mutation store users can stage their changes to be replicated back
to server when becoming online:

Please follow chapters bellow for more information.

## Querying local cache

By default queries are cached based on the type and id field, and the results of performed queries are cached as well and they will be available when the client is offline.

Because of this, when mutations that can change query results are performed, the `refetchQueries` or update options of the mutate method should be used to ensure the local cache is kept up to date.

In the following example, the app will perform an `ADD_TASK` mutation which will create a new task. The app also has a `GET_TASKS` query to list all the tasks. In order to make sure the cache for the `GET_TASKS` query is kept up to date whenever a new task is created, the update option is used to add the newly created task to the cache:

```
  client.mutate({
    mutation: ADD_TASK, variables: item,
    update: updateCacheOnAdd
  });

  function updateCacheOnAdd(cache, { data: { createTask } }) {
    let { allTasks } = cache.readQuery({ query: GET_TASKS });
    if (allTasks) {
      if (!allTasks.find((task) => task.id === createTask.id)) {
        allTasks.push(createTask);
      }
    } else {
      allTasks = [createTask];
    }
    cache.writeQuery({
      query: GET_TASKS,
      data: {
        'allTasks': allTasks
      }
    });
  }
```

## Offline Workflow

By design `client.mutate` function will resolve to error when offline.
Developers can detect offline error and watch offline change to notify

  Usage:
  ```javascript
  client.mutate(...).catch((error)=> {
    // 1. Detect if this was an offline error
   if(error.networkError && error.networkError.offline){
     const offlineError: OfflineError =  error.networkError;
     // 2. We can still track when offline change is going to be replicated.
     offlineError.watchOfflineChange().then(...)
   }
  });
  ```

> Note: Additionally to watching individual mutations framework offers global offline listener
that can be supplied when creating client.

## Global Update Functions

Apollo client holds all mutation parameters in memory. An offline Apollo client will continue to store mutation parameters and once online, it will restore all mutations to memory. Any Update Functions that are supplied to mutations cannot be cached by an Apollo client resulting in the loss of all optimisticResponses after a restart. Update functions supplied to mutations cannot be saved in the cache. As a result, all optimisticResponses will disappear from the application after a restart and it will only reappear when the Apollo client becomes online and successfully syncs with the server.

To prevent the loss of all optimisticResponses after a restart, you can configure the Update Functions to restore all optimisticResponses.


```javascript
const updateFunctions = {
  // Can contain update functions from each component
  ...ItemUpdates,
  ...TasksUpdates
}

let config = {
  mutationCacheUpdates: updateFunctions,
}
```

## Making modifications when offline

Client provides queue that stores mutations performed when offline.
By default queue saves data in storage to be available after application restarts.
Queue will hold requests until application will come back online.

Developers can adjust how queue will process new mutations by supplying custom `NetworkStatus` implementation.

### Online Only Queries

To ensure certain queries are not queued and are always delivered to the network layer, you must make use of Graphql directives.
To do so on your client, ensure the query has the annotation attached like so:

```
exampleQuery(...) @onlineOnly {
  ...
}
```

## Listening for Events

It is possible to provide `offlineQueueListener` in config to be notified about offline related events:

- `onOperationEnqueued` - Called when new operation is being added to offline queue
- `onOperationSuccess` - Called when back online and operation succeeds
- `onOperationFailure` - Called when back online and operation fails with GraphQL error
- `queueCleared` - Called when offline operation queue is cleared


## Cache

Apollo Offline Client is strongly leveraging Apollo Cache.
Please follow documentation for more information about caching in Apollo GraphQL

https://www.apollographql.com/docs/react/advanced/caching.html

### Querying your data

Cache is used to hold data that can be fetched when client is offline.
To effectively work with cache users can use `cache-first` fetchPolicy
when performing queries. This policy will try to use local cache in
situations when cache was already populated with the server side data.

```
    return this.apollo.watchQuery<YourType>({
      query: YOUR_QUERY,
      fetchPolicy: 'cache-first',
    });
```

Cache is going to be refueled by subscriptions, pooling or regular queries happening in UI.

## Designing your types

When designing your GraphQL schema types `id` field will be always required.
We also expect that id will be always queried back from server.
Library will perform business logic assuming that `id` field will be supplied and returned from server. Without this field some offline functionalities will not work properly.
