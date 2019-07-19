## What is new in Offix

### 0.7.0 

#### Dropping support for Apollo mutate method

Apollo Client mutate method is no longer going to offer offline capabilities.
Developers can have more choice where to use offline and conflict resolution capabilties. 

If you want to use offline capabiltiies for particular operation use `client.offlineMutate` method

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

##### Renamed offlineMutation method

`offlineMutation` method was renamed to `offlineMutate`


##### DataSync Config was renamed 

`DataSyncConfig` interface was renamed to `OffixClientConfig`.
Please review if your configuration still conforms to the new interface.

##### Cache Helper Interface changes

Cache Helper interface now will now accept object instead of individual parameters:

```javascript
 const updateFunction = getUpdateFunction({
            mutationName,
            idField,
            operationType,
            updateQuery
 });
```
