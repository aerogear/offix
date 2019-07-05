# Server side conflict resolution

Server side conflict resolution is possible using Node.js package.

## Usage

```
npm install offix-server-conflict
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
const { conflictHandler } = require('apollo-conflicts-server')
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
    const conflict = conflictHandler.checkForConflicts(serverData,clientData)
    if(conflict) {
        throw conflict;
    }
    // 5. Save object to data source
```

Resolvers can be implemented to handle conflicts on client .

## Implementing Custom Conflict Mechanism

The`ObjectState` interface is a complete conflict resolution implementation that provides a set of rules to detect and handle conflict. Interface will allow developers to handle conflict on the client. Client side application will need to match the server side implementation. Currently we support following implementations:

- `VersionObjectState` - allows to operate based on version field in schema
- `HashObjectState` - allows to operate based on object hashes
