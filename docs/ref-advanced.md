# Advanced topics

## Implementing Custom Network Status checks

To use your own custom network checks, implement the [NetworkStatus](NetworkStatus.ts)
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

```javascript
 import { createOptimisticResponse } from "@aerogear/datasync-js";

 createOptimisticResponse("updateTest", "Test", { data: "test" });
```

Users can detect if the provided data is optimistic response by checking `optimisticResponse` flag is set to true.

## Listening to the offline queue events

Developers can implement `offlineQueueListener` that can be passed as config element.
This listener is going to be notified about new items that were added to offline queue.
Listener can be used to build UI support and show pending changes.
This feature can be mixed together with `OptimisticResponse` to deliver great offline experience
See example application for more information.
