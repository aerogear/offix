---
id: react-native
title: React Native - using Datastore for Mobile
sidebar_label: React Native
---

Offix Datastore provides support for `indexeddb` as default. It is necessary to override the default storage and network implementations. 

## Storage

The Datastore provides an SQLite adapter out of the box. In order to enable this storage options can be passed as the second paramater to the datastore constructor.

```javascript
...
import { SQLiteAdapter } from "offix-datastore/dist/storage/adapters/sqlite/SQLiteAdapter";
...

export const datastore = new DataStore({
  // datastore config
}, {
  storeAdapter: new SQLiteAdapter("offixdb", "1.0") // name & version
});
```

## Network Status

Since the default implementation relies on the browser `window.navigator` for network connectivity, it is necessary to provide an implementation of the `NetworkStatus` interface for native application. This can be done with [Capacitor](https://capacitorjs.com/docs/apis/network) or [@react-native-community/netinfo](https://github.com/react-native-community/react-native-netinfo) for React Native.

```javascript
import { NetworkStatus, NetworkStatusEvent } from "offix-datastore";
import Observable from "zen-observable";
import NetInfo from "@react-native-community/netinfo";

/**
 * Uses web api to detect network status changes
 */
export class ReactNativeNetworkStatus implements NetworkStatus {

  public observable: Observable<NetworkStatusEvent>;

  constructor() {
    this.observable = new Observable((observer) => {
      NetInfo.addEventListener((state) => observer.next({ isOnline: state.isConnected }));
    });
  }

  public subscribe(observer: ZenObservable.Observer<NetworkStatusEvent>) {
    return this.observable.subscribe(observer);
  }

  public isOnline(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      NetInfo.fetch()
        .then((state) => resolve(state.isConnected))
        .catch((err) => reject(err));
    });
  }
}
```

This can then be provided as in the config for the Datastore

```javascript
export const datastore = new DataStore({
  // normal config options
  ...
  networkStatus: new ReactNativeNetworkStatus(),
  ...
}, {
  // custom engine config
});
```