---
id: release-notes
title: What is new in Offix
sidebar_label: Release notes
---

# 0.13.0

The 0.13.0 release is a release contains a couple of bug fixes, dependency updates and the new ability to configure your own `CachePersistor` object as requested in [#273](https://github.com/aerogear/offix/issues/273) and [#281](https://github.com/aerogear/offix/issues/281).

The [CachePersistor](https://github.com/apollographql/apollo-cache-persist#using-cachepersistor) is used by the client to persist the Apollo Cache across application restarts. Pass your own instance to override the one that is created by default.

Example:

```js
import { ApolloOfflineClient, createDefaultCacheStorage } from "offix-client";
import { HttpLink } from "apollo-link-http";
import { InMemoryCache } from "apollo-cache-inmemory";
import { CachePersistor } from "apollo-cache-persist";

const link = new HttpLink({ uri: "http://example.com/graphql" });
const cache = new InMemoryCache()

const cachePersistor = new CachePersistor({
  cache,
  storage: createDefaultCacheStorage()
})

const client = new ApolloOfflineClient({
  cache,
  cachePersistor,
  link
});
```

Note: if using TypeScript, you may need to declare the cachePersistor as follows `const cachePersistor = new CachePersistor<object>(...options)` or you may experience compiler errors.

This example uses `createDefaultCacheStorage` to create the default IndexedDB based storage driver. 
The storage can be swapped depending on the platform. For example `window.localstorage` in older browsers or `AsyncStorage` in [React Native](https://offix.dev/docs/react-native).

# 0.12.0

The 0.12.0 release brings a new `offix-client-boost` package. This package is a batteries-included wrapper around the `offix-client` that brings
everything needed to get started with GraphQL quickly. This includes a cache and support for subscriptions and file uploads.

Check out the new documentation at [offix.dev](https://offix.dev).

# 0.11.0

The 0.11.0 release simplifies the creation of offline clients. 

## Breaking Changes

### OfflineClient replaced with ApolloOfflineClient

The `OfflineClient` class has been replaced with `ApolloOfflineClient`. `OfflineClient` was a wrapper that would internally create an `ApolloClient` which could be accessed after initialization. The flow looked something like this.

```js
const offlineClient = new OfflineClient(options)
const apolloClient = await offlineClient.init()
```

The new `ApolloOfflineClient` directly `extends` `ApolloClient` which makes initialization simpler and more flexible as all of the standard Apollo Client options are supported.

Initialization is slightly different, mainly, and `ApolloLink` must be passed that can connect with the GraphQL server. See the example code below.

```js
import { ApolloOfflineClient } from 'offix-client'

const link = new HttpLink({ uri: 'http://localhost/graphql' })
  
const config = {
  link,
  typeDefs,
  resolvers,
  ...otherOptions
}

const client = new ApolloOfflineClient(config)
await client.init()
...

// `client` is an ApolloClient so you can call all of the methods you'd expect
client.query(...)
client.mutate(...)
client.offlineMutate(...)
```

# 0.10.0

The `0.10.0` release builds upon the `0.9.0` release and adds two new packages. `offix-scheduler` and `offix-conflicts-client`

## offix-scheduler

`offix-scheduler` now holds the core functionalities of the Offix project. That includes queueing, scheduling, persistence and fulfilment of offline operations. 

`offix-scheduler` can and will be used to create new clients in the future that are not based on Apollo Client. Clients we are investigating are URQL (see https://github.com/aerogear/offix/issues/235), Relay (see https://github.com/aerogear/offix/issues/236) and plain HTTP/REST. `offix-client` now uses `offix-scheduler` under the hood.

There have been no functional changes to `offix-client` and everything should remain the same.

## offix-conflicts-client

The `offix-conflicts-client` package contains all the interfaces and current implementations for client side pluggable conflict detection and resolution. Right now this package is used in to deliver the conflict capabilities in `offix-client` and it could also be used by package maintainers to implement conflict capabilities in new clients also. It is not important for application developers looking to use `offix-client`

# 0.9.0

The `0.9.0` release is a significant refactor of the internals of Offix and introduces a couple of breaking changes to the end user API.

* We have a new documentation site available at [offix.dev](https://offix.dev). Special thanks to [@LakshanKarunathilake](https://github.com/LakshanKarunathilake) for the complete overhaul.
* All queueing, scheduling, persistence, and replaying of offline operations now happens outside of the Apollo Link chain. Instead we use a much more generic queueing mechanism that opens the door to great flexibility.
* It paves the way for new features in the future. Most importantly, the ability to use Offix with other GraphQL clients, or even with regular RESTful clients (and more).
* The internal architecture of Offix is drastically simplified. It is much easier to understand, maintain and test.

With this release, `OfflineClient` behaves mostly the same way as it has before but there were a couple of breaking changes which are outlined below.

## Background

Previous versions of Offix relied heavily on something called [Apollo Link](https://www.apollographql.com/docs/link/overview/) which is essentially chain of "middleware" functions that can modify the behaviour and results from calls like `ApolloClient.mutate()` and `ApolloClient.query()`. Most of the underlying queueing, scheduling, persistence and replaying of offline mutations done by Offix happened inside the of the Apollo Link chain. This approach seemed like a good idea, but over time we have realised it made things difficult to maintain and it kept us limited in the features we could provide.

## Breaking Changes

### `client.offlineMutation` has been deprecated in favour of `client.offlineMutate`

It didn't make sense to have a `mutate` and `offlineMutation` method. `offlineMutation` has been deprecated in favour of `offlineMutate`. `offlineMutation` can still be used, but it logs a deprecation warning to the console and it will be removed in the next release.

**Suggestion:** Change all uses of `client.offlineMutation` to `client.offlineMutate`

### client.mutate no longer does any offline scheduling

A side effect of our Apollo Link architecture was that `client.mutate()` would also schedule operations while offline (as well as `client.offlineMutation`). Using `client.mutate()` for offline operations was never recommended but it was possible. This is no longer the case.

**Suggestion:** any places where you intentionally have offline behaviour using `client.mutate()` should use `client.offlineMutate()` instead.

### Removed `@OnlineOnly` directive

Because `client.mutate()` does not schedule offline operations anymore, the `@OnlineOnly` directive is no longer useful and has been completely removed.

**Suggestion:** remove all instances of the `@OnlineOnly` directive and ensure mutations that used it are called with `client.mutate()`.

### Errors from `client.offlineMutate()` do not have `networkError` property.

Errors originating from the Apollo Link chain are found on `error.networkError`.
This led to checks in application code such as `if (error.networkError.offline)`,
where `error.networkError` is the actual error thrown.

This is no longer the case. Now the everything is found on the top level `error` object.
See the example below:

```js
const options = {
  mutation: gql`
    mutation greeting($name: String!){
    greeting(name: $name) {
      body
    }
  }`,
  variables: {
    name: 'hello world!'
  }
};

client.offlineMutate(options).catch((error) => {
  // This used to be `if (error.networkError.offline)`
  if(error.offline) {
    // This used to be `error.networkError.watchOfflineChange()`
    error.watchOfflineChange().then(...)
  }
});
```

This is the same for local conflict errors:

```js
client.offlineMutate(options).catch((error) => {
  // This used to be `if (error.networkError.localConflict)`
  if (error.localConflict) {
    // handle local conflict
  }
});
```

**Suggestion:** review all code where `error.networkError.<property name>` is being accessed and change it to `error.<property name>`

### `OfflineQueue` and `OfflineStore` are generic (TypeScript Users Only)

The `OfflineQueue` and `OfflineStore` classes and some related interfaces have been refactored to handle generic objects. TypeScript users may experience compilation issues if their application references these types.

New types have been added to `offix-client` for Apollo specific usage.

**Suggestion:** Migrate the following references:

* `OfflineQueue` becomes `ApolloOfflineQueue`
* `OfflineStore` becomes `ApolloOfflineStore`
* `OfflineQueueListener` becomes `ApolloOfflineQueueListener`
* `IResultProcessor` becomes `ApolloIResultProcessor`

### New Arguments passed to registerOfflineEventListener functions

`registerOfflineEventListener` registers functions that are called on events originating from the `OfflineQueue`.

```js
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

In previous versions of `offix-client`, these functions had an [Apollo Operation](https://www.apollographql.com/docs/link/overview/) object passed to them. Because Offix no longer uses Apollo Link, this is no longer the case. Instead an [`ApolloQueueEntryOperation`](https://github.com/aerogear/offix/blob/b1e42936ff05a3d21c93795eadba07217bd13f23/packages/offix-client/src/apollo/ApolloOfflineClient.ts#L53) is passed. See the example object below.

```
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

**Suggestion:** review any code where `registerOfflineEventListener` is used and refactor the listener functions to use the new data structure being passed.

### Operations Stored in OfflineStore are not backwards compatible

Because of the architectural changes to Offix, the objects stored in the OfflineQueue and OfflineStore are different. Previously, the queue and storage mechanisms were based around the [Apollo Operation](https://www.apollographql.com/docs/link/overview/).

`offix-client` now queues and stores objects based off the `MutationOptions` object. Unfortunately these changes were not backwards compatible. Existing applications using `offix-client` that have pending offline operations will not be able to load and requeue those operations after an upgrade to the latest version. The data will still exist in the store and it will be accessible manually. Developers will have to migrate the data themselves. **Data in the Apollo Cache is not affected.** We hope this issue will affect very few users if any at all.

To ensure this doesn't happen in future, we have implemented versioning and new serialize/deserialize interfaces that will allow our storage mechanism to handle these types of upgrades/migrations.

**Suggestions:**

* Ensure users have no pending offline operations before administering the update.
* Manually migrate the data using custom application code.
* If it's not critical, users can re-enter the data or redo their offline operations.

## Features

### New Documentation Website!

Our documentation website has been rebuilt using Docusaurus. Special thanks to [@LakshanKarunathilake](https://github.com/LakshanKarunathilake) for the complete overhaul.

### OfflineQueue is directly accessible on the client

`client.queue` is now directly accessible. This opens up the possibility for your application to directly see the operations in the queue. It also means you can manually call `client.queue.forwardOperations()` to execute all operations in the queue.

### OfflineClient accepts user provided `InMemoryCache`

It is now possible to pass your own `InMemoryCache` into `OfflineClient`. This makes it possible to configure things like cache redirects.

```js
const cache = new InMemoryCache(yourCacheConfig);

const offlineClient = new OfflineClient({
  httpUrl: 'https://example.com',
  cache
});
```

### OfflineClient enables wiping out cache using persistor interface

`offlineClient.persitor.purge()` method will wipe entire persistence layer for Apollo cache.

> NOTE: InMemoryCache needs to be wiped out as well along with the client. Please execute `offlineClient.cache.rest()`

# 0.8.0

## Features

### Offix React Hooks Alpha released

Offix React Hooks provides helpers for using offix within React and React Native.
Please refer to package README for more information

### Ability to customize Apollo Link chain

`OffixClientConfig.terminatingLink` allows to customize client by adding additional links
for handling authentication, network requests etc.

### New way to access Apollo Client

`OfflineClient.apolloClient` is now public. This means `apolloClient` is directly accessible after `OfflineClient.init()`.

## Breaking changes

### Changes for Subscriptions and File Uploads

Subscriptions and file uploads were removed from the main library.
Developers can still configure Subscription access directly int their application by
creating Apollo link acording to documentation and passing `OffixClientConfig.terminatingLink`

### 0.7.1

#### Offline operations persist optimistic response

Offline operations will now cache update functional and automatically apply optimistic response
`OffixClientConfig.mutationCacheUpdates` is still required to see optimistic responses after application restart.

#### watchOfflineChange returns mutation result

We have discovered bug where `watchOfflineChange` method from `OfflineError` was missing mutation results.
This is now fixed so your UI can instantly watch for offline chances and render when succeeded.

### 0.7.0

#### Support Apollo 2.6.x

Apollo Client 2.6.x with new typings is now supported.

#### Extended conflict support

New conflict implementation requires changes on both client and server.
On server we have changed conflict detection mechanism to single method.
Server side conflict resolution was removed due to the fact that we could not provide
reliable diff source without separate store.

##### Server side implementation:

```javascript
 const conflictError = conflictHandler.checkForConflict(greeting, args);
      if (conflictError) {
        throw conflictError;
      }
}
```

##### Client side implementation:

Client side implementation now requires users to apply `returnType` to context when performing a mutation.
Conflict interface now has an additional method `mergeOccured` that will be triggered when a conflict was resolved without data loss.

Please refer to documentation for more details.

#### Breaking changes

##### DataSync Config renamed

`DataSyncConfig` interface was renamed to `OffixClientConfig`.
Please review if your configuration still conforms to the new interface.

##### Cache Helper Interface

Cache Helper interface now will now accept object instead of individual parameters:

```javascript
const updateFunction = getUpdateFunction({
  mutationName,
  idField,
  operationType,
  updateQuery
});
```
