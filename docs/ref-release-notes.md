## What is new in Offix

### 0.7.0 

#### Extented conflict support

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

Client side implementation requires now users to apply `returnType` to context when performing mutation.
Conflict interface have now additional method `mergeOccured` that will be triggered when conflict was 
resolved without data loss.

Please refer to documentation for more details.



