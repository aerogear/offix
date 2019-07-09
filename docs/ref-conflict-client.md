# Client Side Conflict Resolution

When performing data synchronization between multiple clients it is common for remote devices to become offline for a certain amount of time. As a result of being offline, data that is modified by a client can become outdated with the server. Further operations on that record can cause a conflict (often called a collision).

Offix provides a way to manage and resolve these conflicts for any GraphQL type by supplying a `returnType` field with any mutation you wish to resolve conflicts for. For more information, please see [Offline Support](ref-offline.md). Offix attempts to resolve all conflicts at the field level first, meaning that even if the client data is outdated with the server data it may not trigger a conflict.

## Working with Conflict Resolution

To enable the client to resolve conflicts, developers first need to configure their resolvers to return the conflict back to the client upon detection. For more information about how to do this, please see [Server Side Conflict Resolution](ref-conflict-server.md)
The client will then automatically resolve them based on the current strategy and notify listeners if the developer supplied any.

Conflict resolution will work out of the box with the recommended defaults and does not require any specific handling on the client.

> For advanced use cases developers may customize their conflict implementation by supplying a custom `conflictProvider` in config. See Conflict Resolution Strategies below.

## Default Conflict Implementation

By default, conflict resolution is configured to rely on a `version` field on each GraphQL type.
For example:

```javascript
type User {
  id: ID!
  version: String!
  name: String!
}
```

The version field is controlled on the server and will map the last version that was sent from the server. All operations on the version field happen automatically, however, users need to make sure that the version field is always passed to server for mutations that supports conflict resolution:

```javascript
type Mutation {
  updateUser(id: ID!, version: String!): User
}
```

Alternatively developers can create input elements that can be reused in every mutation and support conflict resolution.

```javascript
type Mutation {
  updateUser(user: UserInput): User
}
```

### Custom Conflict State

The default object state Offix uses is `VersionedObjectState`. This means Offix expects all data which could be conflicted to have a version field. If this is not the case, developers can also provide custom state which Offix will then use for conflict resolution. To do this, Offix expects certain functions to be available under the `conflictProvider` option in config. These functions and their signatures are:

`assignServerState(client, server)` - assigns the server state to the client state to reduce the chance of a second conflict.

`hasConlict(client, server)` - detects whether or not both sets of data are conflicted.

`getStateFields()` - returns an array of fields that should not be taken into account for conflict purposes.

`currentState(objectWithState)` - returns the current state of the object.

## Conflict Resolution Strategies

Offix allows developers to define custom conflict resolution strategies. You can provide custom conflict resolution strategies to the client in the config by using the provided `ConflictResolutionStrategies` type. By default developers do not need to pass any strategy as `ClientWins` is the default. Custom strategies can be used also to provide different resolution strategy for certain operations:

```javascript
let customStrategy = {
  resolve = (base, server, client, operationName) => {
    let resolvedData;
    switch (operationName) {
      case "updateUser":
        delete client.socialKey
        resolvedData = Object.assign(base, server, client)
        break
      case "updateRole":
        client.role = "none"
        resolvedData = Object.assign(base, server, client)
        break
      default:
        resolvedData = Object.assign(base, server, client)
    }
    return resolvedData
  }
}
```

This custom strategy provides two custom strategies to be used when a conflict occurs. They are based on the name of the operation to give developers granular control. To use this custom strategy pass it as an argument to conflictStrategy in your config object:

```javascript
let config = {
...
  conflictStrategy: customStrategy
...
}
```

## Listening to Conflicts

Offix allows developers to receive information about the data conflict that occurred between the client and the server. The client can be notified in one of two scenarios.

When a conflict occurs Offix will attempt to do a field level resolution of data - meaning it will check all fields of your type to see if both the client or server has changed them.

If both client and server have changed any of the same fields then the `conflictOccurred` method of your `ConflictListener` will be triggered.

If the client and server have not changed any of the same fields and the data can be easily merged then the `mergeOccurred` method of your `ConflictListener` will be triggered.

Developers can supply their own `conflictListener` implementation

```typescript
class ConflictLogger implements ConflictListener {
    conflictOccurred(operationName, resolvedData, server, client) {
      console.log("Conflict occurred with the following:")
      console.log(`data: ${JSON.stringify(resolvedData)}, server: ${JSON.stringify(server)}, client: ${JSON.stringify(client)}, operation:  ${JSON.stringify(operationName)}`);
    }
    mergeOccurred(operationName, resolvedData, server, client) {
      console.log("Merge occurred with the following:")
      console.log(`data: ${JSON.stringify(resolvedData)}, server: ${JSON.stringify(server)}, client: ${JSON.stringify(client)}, operation:  ${JSON.stringify(operationName)}`);
    }
  }
}

let config = {
...
  conflictListener: new ConflictLogger()
...
}
```
