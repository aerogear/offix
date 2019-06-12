---
layout: page
title: Client Conflict
navigation: 4
---

## Conflicts

When obtaining copy of the server side data, client data can get out of the sync.
Edits that happened on the client data need to be replicated back to server.
When replicating local changes to server it may happen that local changes no longer reflect the server state.
This situations are often called "Data Conflicts" or "Data Collisions"

Offline client offers way to detect and handle conflicts for any GraphQL type by supplying
`ConflictLink` implementation to client.
When collision is detected it can be handled on both server or client.

### Working with Conflict Resolution

Conflict resolution allows developers to define way to determine how conflicts are detected and handled.
Conflict resolution can be fully controlled by server side implementation.
If users chose to resolve conflicts in the client they need to configure their resolvers first return conflict back to client. Client will resolve them automatically basing on current strategy and notify listeners if developer supplied any.

Conflict resolution will work out of the box with recommended defaults and do not require any specific handling on the client.

> For advanced use cases users may customize conflict implementation by supplying custom `conflictStateProvider` in config.

### Default conflict implementation

By default plugable conflict resolution is configured to rely on `version` field on each
GraphQL type.
For example:

```javascript
type User {
  id: ID!
  version: String!
  name: String!
}
```

Version field is going to be controlled on the server and will map last version
that was sent from server. All operations on version field happen automatically
however users need to make sure that version field is always being passed to server
for mutations that supports conflict resolution:

```javascript
type Mutation {
  updateUser(id: ID!, version: String!): User
}
```

Alternatively developers can create input element that can be reused in every mutation
that supports conflict resolution

```javascript
type Mutation {
  updateUser(user: UserInput): User
}
```

### Conflict resolution strategies

Client can define custom resolution strategies.
You can provide custom conflict resolution strategies to the client in the config by using the provided `ConflictResolutionStrategies` type from the SDK. By default developers do not need to pass any strategy (`clientVersionWins` strategy is used).
Custom strategies can be used also to provide different resolution strategy for certain operations:

```javascript
let updateUserConflictResolver = (serverData, clientData) => {
    delete clientData.socialKey
    return Object.assign(serverData, clientData);
};

let updateTaskConflictResolver = (serverData, clientData) => {
    ...
};

let defaultConflictResolver = (serverData, clientData) => {
  ...
};
```

> Note: Client strategies will work only when specific server side resolver explicitly states that conflicts should be fixed on the client. Client strategy will be ignored when conflict is resolved on the server.

To use strategy pass it as argument to conflictStrategy in your config object, containing a default to use in the case where you do not provide a strategy for a specific mutations:

```javascript
let config = {
...
  conflictStrategy: {"TaskUpdated": updateTaskConflictResolver, "UserUpdated": updateUserConflictResolver, "default": defaultConflictResolver}
...
}
```

### Listening to conflicts

Framework allows to receive information about the data conflict that occurred between client and server. Client will be notified for both server and client conflicts.

Developers can supply their own `conflictListener` implementation

```typescript
class ConflictLogger implements ConflictListener {
    console.log(`data: ${JSON.stringify(resolvedData)}, server: ${JSON.stringify(server)} client: ${JSON.stringify(client)} `);
  }
}

let config = {
...
  conflictListener: new ConflictLogger()
...
}
```
