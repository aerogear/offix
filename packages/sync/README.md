# AeroGear Apollo GraphQL Voyager client

Client SDK for [Apollo Voyager Server](https://github.com/aerogear/apollo-voyager-server)

# Getting Started

## Importing the package
```javascript
import {
  createClient,
  strategies
} from '@aerogear/datasync-js';
```

## Configuration

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
offlineQueueListener| listener that can be configured to receive events from offline queue | undefined

## Creating a Client
```javascript
let client = createClient(config);
```
# Example application

Try SDK using sample application:
https://github.com/aerogear/apollo-voyager-ionic-example


# Basic concepts

Client is basing on Apollo GraphQL client that can be used with various web and mobile frameworks.
We provide version for web and Apache Cordova.
For basic concepts about Apollo GraphQL please refer to documentation for your own platform.

For React:
https://www.apollographql.com/docs/react/

For Angular:
https://www.apollographql.com/docs/angular/


## Cache

Client is strongly leveraging Apollo Cache layer.
Please follow documentation for more information about caching in Apollo GraphQL

https://www.apollographql.com/docs/react/advanced/caching.html


## Designing your types

When designing your GraphQL schema types `id` field will be always required.
We also expect that id will be always queried back from server.
Library will perform business logic assuming that `id` field will be supplied and returned from server. Without this field some offline functionalities will not work properly.


# Offline support

SDK provides first class support for performing GraphQL operations while offline.
Queries and mutations are hold in queue that is being configured to hold requests when client goes offline.
When client goes offline for long periods of time clients will be able still negotiate local updates
with the server state thanks to powerful conflict resolution strategies.
Please follow chapters bellow for more information.

## Querying local cache

By default client will save all performed query results in the cache.
Data will be available to be used when application goes offline.
Queries are cached out of the box based on the type and `id` field.
When performing mutations that affects some queries users can use `refetchQueries` or `update` fields when performing mutations:

```
    client.mutate<Task>({
      mutation: ADD_TASK, variables: item,
      optimisticResponse: createOptimisticResponse('createTask', 'Task', item),
      update: this.updateCacheOnAdd
    });
```

## Making modifications when offline

AeroGear Sync SDK provides queue that stores mutations performed when offline.
By default queue saves data in storage to be available after application restarts.
Queue will hold requests until application will come back online.

Developers can adjust how queue will process new mutations by supplying custom `NetworkStatus` implementation.

### Online Only Queries

To ensure certain queries are not queued and are always delivered to the network layer, you must make use of Graphql directives.
To do so on your client, ensure the query has the annotation attached like so:

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

## Conflicts

TODO

### Conflict strategies

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

# Advanced topics

## Implementing Custom Apollo Links

To use your own custom apollo links to create your own set of operation processors, simply follow the documentation for creating links here: https://www.apollographql.com/docs/link/index.html. You can pass this building mechanism to your client in the config, under the `customLinkBuilder` parameter.

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

## Logging debug messages

Sync package is using debug package to print out debug messages

To enable debug please execute in console
`localStorage.debug = 'AeroGearSync:*'`

Some certain features can be enabled separately

`localStorage.debug = 'AeroGearSync:OfflineMutations*'`



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


