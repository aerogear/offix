---
id: release-notes
title: What is new in Offix
sidebar_label: Release notes
---

# Next

The `<version number>` release is a significant refactor of the core internals of Offix.

* All queueing, scheduling, persistence, and replaying of offline operations now happens outside of the Apollo Link chain. Instead we use a much more generic queueing mechanism that opens the door to great flexibility.
* It paves the way for new features in the future. Most importantly, the abiliy to use Offix with other GraphQL clients, or even with regular RESTful clients (and more).
* The internal architecture of Offix is drastically simplified. It is much easier to understand, maintain and test.

With this release, `OfflineClient` behaves mostly the same way as it has before but there were a couple of necessary breaking changes introduced that are outlined below.

## Background

Previous versions of Offix relied heavily on something called [Apollo Link](https://www.apollographql.com/docs/link/overview/) which is essentially chain of "middleware" functions that can modify the behaviour and results from calls like `ApolloClient.mutate()` and `ApolloClient.query()`. Most of the underlying queueing, scheduling, persistence and replaying of offline mutations done by Offix happened inside the of the Apollo Link chain. this approach seemed like the best idea but over time we have realised it made things difficult to maintain and it kept us limited in the features we could provide.

## Breaking Changes

### client.offlineMutation has been deprecated in favour of `client.offlineMutate`

It didn't make sense to have a `mutate` and `offlineMutation` method. `offlineMutation` has been deprecated in favour of `offlineMutate`. `offlineMutation` can still be used, but it logs a deprecation warning to the console and it will be removed in the next release.

Suggestion: Use change all uses of `client.offlineMutation` to `client.offlineMutate`

### client.mutate no longer does any OfflineScheduling

A side effect of our Apollo Link architecture was that `client.mutate()` would also schedule operations while offline (as well as `client.offlineMutation`). Using `client.mutate()` for offline operations was never recommended but it was possible. This is no longer the case.

Suggestion: any places where you intentionally have offline behaviour using `client.mutate()` should use `client.offlineMutate()` instead.

### Removed @OnlineOnly directive

Because `client.mutate()` does not schedule offline operations anymore, the `@OnlineOnly` is no longer useful and has been completely removed.

Suggestion: remove all instances of the `@OnlineOnly` directive and ensure those mutations are called using `client.mutate()`.

## Features

### Offline client enables wiping out cache using persistor interface

`offlineClient.persitor.purge()` method will wipe entire persistence layer for Apollo cache

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
