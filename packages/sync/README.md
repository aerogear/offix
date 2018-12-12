## AeroGear Services Sync SDK

Package maintained as part of AeroGear Services SDK.

See: https://github.com/aerogear/aerogear-js-sdk for documentation


# Importing the package
```javascript
import {
  createClient,
  strategies
} from '@aerogear/datasync-js';
```

# Configuration
To provide custom configuration to the client, the following options are available. If you wish, these are also available by using the `DataSyncConfig` interface from the SDK.

```javascript

let config: DataSyncConfig = {
  httpUrl: "http://localhost:4000/graphql",
  wsUrl: "ws://localhost:4000/graphql",
}
```

Config | Description | Default
------ | ------ | ------
httpUrl | The URL of your http server | N/A
wsUrl | The URL of your websocket | N/A
storage | The storage you want your client to use | window.localStorage
conflictStrategy | The conflict resolution strategy your client should use | N/A
customLinkBuilder | Enables providing custom Apollo Link for processing requests | See `LinksBuilder`
networkStatus | Implementation of `NetworkStatus` Interface | See `WebNetworkStatus` and `CordovaNetworkStatus`
mutationsQueueName | The name to store requests under in your offline queue | "offline-mutation-store"
squashing | Whether or not you wish to squash mutations in your queue | true
offlineQueueListener| listener that can be configured to receive events from offline queue

# Creating a Client
```javascript
let client = createClient(config);
```


## Conflict strategies
You can provide your custom conflict resolution strategies to the client in the config by using the provided `ConflictResolutionStrategy` type from the SDK. An example custom strategy is shown below.

```javascript
let clientWins = (serverData, clientData) => {
  return Object.assign(server, client);
};
```

To use this strategy pass this function as conflictStrategy in your config object like so:

```javascript
let config = {
...
  conflictStrategy: clientWins
...
}
```

## Implementing Custom Apollo Links
To use your own custom apollo links to create your own network flow, simply follow the documentation for creating links here: https://www.apollographql.com/docs/link/index.html. You can pass this building mechanism to your client in the config, under the `customLinkBuilder` parameter.

```javascript
export const linkBuilder: LinkChainBuilder = (): ApolloLink => {
    const httpLink = new HttpLink({ uri: "someUri" });
    const customLink = new YourCustomLink();

    let links: ApolloLink[] = [customLink, httpLink];

    let compositeLink = ApolloLink.from(links);
    return compositeLink;
  };
```

## Implementing Custom Network Status checks
To use your own custom network checks, implement the [NetworkStatus](https://github.com/aerogear/aerogear-js-sdk/blob/master/packages/sync/src/offline/NetworkStatus.ts)
 interface which provides two functions;

```javascript
  onStatusChangeListener(callback: NetworkStatusChangeCallback): void;

  isOffline(): boolean;
```

## Offline Mutations

AeroGear Sync SDK provides offline mutations out of the box. By default it uses localStorage to do this and mutations are stored under the cache key of 'offline-mutations-queue'.

### Online Only Queries
To ensure certain queries are not queued and are always delivered to the network layer, you must make use of Graphql directives.To do so on your client, ensure the query has the annotation attached like so:

```
exampleQuery(...) @onlineOnly {
  ...
}
```

### Squashing Mutations

Multiple changes performed on the same object ID and with the same mutation will automatically be joined by the AeroGear Sync SDK when your client is offline. This is beneficial as the client will not have to queue a large amount of mutations to replay once it returns online.

#### Global Squashing
This feature is on by default at a global level. To disable it on a global level simply do so in your config:

```javascript
let config = {
...
  squashing: false
...
}
```

#### Mutation Level Squashing
To disable this feature at a mutation level be sure to include the annotation on the mutation like so:

```
exampleMutation(...) @noSquash {
  ...
}
```

## Designing your types

When designing your GraphQL schema types `id` field is always required.
Library will perform business logic assuming that `id` field will be supplied and returned from server. Without this field some offline functionalities will not work properly.

## Optimistic UI

By default user changes that are made when offline will not appear in the app
until they going to be synced to server. In some circumstances users may want to see them instantly to perform various operations on the data
When performing mutations users can decide to supply `optimisticResponse` object that will
appear instantly in the application UI. SDK provides helper method to work with optimistic responses.

```
 import { createOptimisticResponse } from "@aerogear/datasync-js";

 createOptimisticResponse("updateTest", "Test", { data: "test" });
```

Users can detect if the provided data is optimistic response by checking `optimisticResponse` flag is set to true.
This can be used in UI to show pending changes.

> Note: pending changes created by helper are read only. Performing any additional
operations on pending objects will result in error due to fact that next changes will be missing actual ID that can be created on server side.

# Contribution guide

## Logging debug messages

Sync package is using debug package to print out debug messages

To enable debug please execute in console
`localStorage.debug = 'AeroGearSync:*'`

Some certain features can be enabled separately

`localStorage.debug = 'AeroGearSync:OfflineMutations*'`
