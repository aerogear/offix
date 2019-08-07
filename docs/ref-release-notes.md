## What is new in Offix

# Unreleased

# Fixed

*

# Added

* `OfflineClient.apolloClient` is now public. This means `apolloClient` is directly accessible after `OfflineClient.init()`.

# Changed

*  `OfflineClient.init()` accepts now additional `terminatingLink` parameter 
that can be used to modify the way the network request is made. 
Parameter is optional - by default we going to use HttpLink implementation.

# Removed

* Out of the box support for file uploads and subscriptions from the library.
Please use  `OfflineClient.init(terminatingLink)` where `terminatingLink` 
can be any ApolloLink implementation that will make request to server.

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
Conflict interface now has an additional method `mergeOccured` that will be triggered when a conflict was  resolved without data loss.

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

