---
id: client-configuration
title: Client Configuration
sidebar_label: Client Configuration
---

## offix-client

### `ApolloOfflineClient`

`ApolloOfflineClient` extends the `ApolloClient` class. Check the [`ApolloClient` constructor docs](https://www.apollographql.com/docs/react/v2.5/api/apollo-client/#apolloclient) to see the options that can be passed.

There are some additional options specific to `ApolloOfflineClient`.

* `cacheStorage` - The [PersistentStore](https://github.com/aerogear/offix/blob/master/packages/offix-offline/src/offline/storage/PersistentStore.ts) you want your client to use for persisting the Apollo Cache (Uses indexeddb by default).
* `offlineStorage` - The [PersistentStore](https://github.com/aerogear/offix/blob/master/packages/offix-offline/src/offline/storage/PersistentStore.ts) you want your client to use for persisting offline operations in the offline queue (Uses indexeddb by default).
* `networkStatus` - [NetworkStatus](https://github.com/aerogear/offix/blob/master/packages/offix-offline/src/offline/network/NetworkStatus.ts) Interface for detecting changes in network status. (Uses browser networking APIs by default)
* `offlineQueueListener` - [ApolloOfflineQueueListener](./ref-offline.md#listening-for-events) User provided listener that contains a set of methods that are called when certain events occur in the queue.
* `conflictProvider` - [ObjectState](./ref-conflict-server.md#implementing-custom-conflict-resolution) Interface that defines how object state is progressed. This interface needs to match state provider supplied on server.
* `conflictStrategy` - [ConflictResolutionStrategy](https://github.com/aerogear/offix/blob/master/packages/offix-conflicts-client/src/strategies/ConflictResolutionStrategy.ts)interface used on the client to resolve conflicts. The [default strategy](https://github.com/aerogear/offix/blob/master/packages/offix-conflicts-client/src/strategies/strategies.ts) merges client changes onto the server changes.
* `mutationCacheUpdates` - [CacheUpdates](./ref-offline.md#global-update-functions) Cache updates functions for your mutations. Argument allows to restore optimistic responses on application restarts.
* `retryOptions` - The options to configure how failed offline mutations are retried. See [`apollo-link-retry`](https://www.apollographql.com/docs/link/links/retry/).

## offix-client-boost

### `createClient`

`createClient` accepts all of the `ApolloOfflineClient` options described above as well as the ones listed below.

* `httpUrl` (required) - The URL of the GraphQL server
* `wsUrl` (required) - The URL of the websocket endpoint for subscriptions
* `cache` - The Apollo [InMemoryCache](https://www.apollographql.com/docs/react/caching/cache-configuration/) that will be used. (creates one by default).
* `authContextProvider` - An object or an `async` function that returns an [`AuthContext`](https://github.com/aerogear/offix/blob/master/packages/offix-client-boost/src/auth/AuthContexrProvider.ts) object with authentication headers that will be passed in GraphQL requests and in the `connectionParams` of websocket connections.
* `fileUpload` - If set to `true`, GraphGL file uploads will be enabled and supported. (default is `false`)
* `websocketClientOptions` - Options for the websocket client used for subscriptions. See [subscriptions-transport-ws](https://www.npmjs.com/package/subscriptions-transport-ws)