---
layout: page
title: Server Conflicts
navigation: 5
---


# Server side conflict resolution

Server side conflict resolution is possible using Node.js package.

## Usage

```
npm install apollo-conflicts-server
```

# Conflict Resolution

## Prerequisites:

- GraphQL server with resolvers
- Database or any other form of data storage that can cause data conflicts

## Enabling Conflict Resolution

To enable conflict resolution developers need to use one of the pluggable conflict resolution strategies in each individual resolver. Depending on the strategy developers will need to provide additional details.

### Version Based Conflict Resolution

1. Add conflict package dependency to project

```javascript
const { conflictHandler } = require('@aerogear/voyager-conflicts')
```

2. Add version field to GraphQL type that should support conflict resolution

```graphql
type Greeting {
    msg: String
    version: Int
  }
```

3. Add example mutations

```graphql
  type Mutation {
    changeGreeting(msg: String!, version: Int!): Greeting
  }
```

4. Implement resolver for mutation

Every conflict can be handled using a set of predefined steps

```javascript
    // 1. Read data from data source
    // 2. Check for conflicts
    if (conflictHandler.hasConflict(serverData,clientData)) {
      // 3. Resolve conflict (client or server) and return error to client
      return await conflictHandler.resolveOnClient(serverData, clientData).response
    }
    // 4. Call next state to update
    greeting = conflictHandler.nextState(clientData)
    // 5. Save object to data source
```

Resolvers can be implemented to handle conflicts on client or server.
Depending on  the strategy used, the resolver implementation will differ.
Please see the chapter below for individual implementations.

## Options for Resolving Conflicts

Conflicts can be resolved on server or client depending on the resolver implementation

### Conflicts on the Client

```javascript
// Data
const serverState = ...

changeGreeting: async (obj, clientState, context, info) => {
    if (conflictHandler.hasConflict(serverState, args)) {
      const clientState = args
      return await conflictHandler.resolveOnClient(serverState, clientState).response
    }
    serverState = conflictHandler.nextState(clientState)
    return serverState
}
```

### Conflicts on the Server

```javascript
// Data
const serverState = ...

 changeGreeting: async (obj, clientState, context, info) => {
      if (conflictHandler.hasConflict(serverState, clientState)) {
        const strategy = customGreetingResolutionStrategy
        const { resolvedState, response } = await conflictHandler.resolveOnServer(strategy, serverState, clientState)
        serverState = resolvedState
        return response
      }
      serverState = conflictHandler.nextState(clientState)
      return serverState
    }
```

> Note: For complete implementation see example application located in `examples/conflicts` folder.


## Client Conflict implementation

See [Voyager Client documentation](https://github.com/aerogear/aerogear-js-sdk/tree/master/packages/sync#conflicts)


## Implementing Custom Conflict Mechanism

The`ObjectState` interface is a complete conflict resolution implementation that provides a set of rules to detect and handle conflict. Interface will allow developers to handle conflict on the client or the server. `nextSate` method is a way for interface to modify existing object before is being saved to the database.
For example when using `lastModified` field as a way to detect conflicts:

```typescript
 public nextState(currentObjectState: ObjectStateData) {
    currentObjectState.lastModified = new Date()
    return currentObjectState
  }
```
