# Server side conflict resolution

Offix provides out of the box conflict resolution for Node.JS platform.
For other languages you can follow Conflict specification chapter to implement custom detectiom mechanism for your resolvers.

## Usage

Install conflict package inside your Node.js project.

```
npm install offix-conflicts-server
```

## Conflict Resolution

### Prerequisites:

- GraphQL server with resolvers
- Database or any other form of data storage that can cause data conflicts

## Enabling Conflict Resolution

To enable conflict resolution developers need to use one of the pluggable conflict implementations in each individual resolver.


### Version Based Conflict Resolution

1. Add conflict package dependency to project

```javascript
const { conflictHandler } = require('offix-conflicts-server')
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

## Implementing Custom Conflict Implementation

The`ObjectState` interface is a complete conflict resolution implementation that provides a set of rules to detect and handle conflict. Interface will allow developers to handle conflict on the client. Client side application will need to match the server side implementation. Currently we support following implementations:

- `VersionObjectState` - allows to operate based on version field in schema
- `HashObjectState` - allows to operate based on object hashes

## Conflict Resolution Specification for other languages

Conflict resolution package can be replicated to any language by implementing conflict detection logic in resolvers. 

Conflict detection should return specific format of error when conflict will be detected. This error will be processed by offix client and send back again as new mutation. To detect conflicts on the server 
you can use one of many strategies for example:

- Calculate hashes of the data
- Use specialized field like version or lastChangedDate
- Have separate storage with history of the changes

### Structure of the conflict error

Server needs to return specific error when conflict is detected
containing server and client states:

```js
 "extensions": {
        "code": "INTERNAL_SERVER_ERROR",
        "exception": {
          "conflictInfo": {
            "serverState": {
                 //..
            },
            "clientState": {
              //..
            }
          },
        }
 }
```