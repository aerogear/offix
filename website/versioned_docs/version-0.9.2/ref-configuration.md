---
id: version-0.9.2-client-configuration
title: Client Configuration
sidebar_label: Client Configuration
original_id: client-configuration
---

The `OfflineClient(options)` constructor takes a number of configuration options.

* `httpUrl` -  URL of the HTTP server that will be used to create a default HTTP link. Ignored if `terminatingLink` is passed.
* `terminatingLink` -  [ApolloLink](https://www.apollographql.com/docs/link/) that will be used to create the client. Used for more advanced configurations such as enabling subscriptions.
* `storage` - The [PersistentStore](https://github.com/aerogear/offix/blob/master/packages/offix-offline/src/offline/storage/PersistentStore.ts) you want your client to use (Uses indexeddb by default).
* `cache` The Apollo [InMemoryCache](https://www.apollographql.com/docs/react/caching/cache-configuration/) that will be used. (creates one by default).
* `networkStatus` [NetworkStatus](https://github.com/aerogear/offix/blob/master/packages/offix-offline/src/offline/network/NetworkStatus.ts) Interface for detecting changes in network status.
* `offlineQueueListener` [ApolloOfflineQueueListener](./ref-offline.md#listening-for-events) User provided listener that contains a set of methods that are called when certain events occur in the queue.
* `conflictProvider` [ObjectState](./ref-conflict-server.md#implementing-custom-conflict-resolution) Interface that defines how object state is progressed. This interface needs to match state provider supplied on server.
* `mutationCacheUpdates` [CacheUpdates](./ref-offline.md#global-update-functions) Cache updates functions for your mutations. Argument allows to restore optimistic responses on application restarts.
* `retryOptions` The options to configure how failed offline mutations are retried. See [`apollo-link-retry`](https://www.apollographql.com/docs/link/links/retry/).