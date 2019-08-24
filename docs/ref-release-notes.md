## What is new in Offix


# 0.9.0 

Ability to add item to offline queue by bypasing 
Network interface. `saveToOffline` flag can be added now to the
context.

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

