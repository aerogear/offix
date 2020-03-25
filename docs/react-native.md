---
id: react-native
title: React Native
sidebar_label: React Native
---

To integrate offix in React Native, developers need to provide custom storage and network layers,
a working example can be found in the offix [React Native example app](https://github.com/aerogear/offix/tree/master/examples/react-native).

We recomend developers use following React Native plugins:

- `@react-native-community/async-storage` - for storage
- `@react-native-community/netinfo` - for network information

Note: if you are using [Expo](https://expo.io/), you must use the [AsyncStorage included in `react-native`](https://facebook.github.io/react-native/docs/asyncstorage) instead.

## Integration

To integrate with offix we need to create wrappers for storage and network.

Note: if using expo, you will need to `import { AsyncStorage } from 'react-native';` instead of using the `@react-native-community/async-storage` package.

For the network listener, create a new class `ReactNativeNetworkStatus.js`.

```js
import NetInfo from "@react-native-community/netinfo";

export class ReactNativeNetworkStatus {

  listeners = [];

  constructor() {
    NetInfo.addEventListener(this.handleNetworkStatusChange.bind(this));
  }

  addListener(listener) {
    this.listeners.push(listener);
  }

  removeListener(listener) {
    const index = this.listeners.indexOf(listener);
    if (index >= 0) {
      this.listeners.splice(index, 1);
    }
  }

  isOffline() {
    return new Promise((resolve) => {
      NetInfo.fetch().then(state => {
        resolve(!state.isInternetReachable);
      });
    });
  }

  handleNetworkStatusChange(state) {
    const online = state.isInternetReachable;
    this.listeners.forEach((listener) => {
      listener({ online });
    });
  }
}
```

```js
import { ApolloOfflineClient } from 'offix-client'
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from 'apollo-link-http';
import AsyncStorage from '@react-native-community/async-storage'
import NetInfo from '@react-native-community/netinfo'
import ReactNativeNetworkStatus from './ReactNativeNetworkStatus'

// Create cache wrapper
const cacheStorage = {
  getItem: async (key) => {
    const data = await AsyncStorage.getItem(key);
    if (typeof data === 'string') {
      return JSON.parse(data);
    }
    return data;
  },
  setItem: async (key, value) => {
    let valueStr = value;
    if (typeof valueStr === 'object') {
      valueStr = JSON.stringify(value);
    }
    return AsyncStorage.setItem(key, valueStr);
  },
  removeItem: async (key) => {
    return AsyncStorage.removeItem(key);
  }
};

// Init network interface
const networkStatus = new ReactNativeNetworkStatus();

// Create client
const offlineClient = new ApolloOfflineClient({
  cache: new InMemoryCache(),
  link: new HttpLink({ uri: 'http://localhost:4000/graphql' }),
  offlineStorage: cacheStorage,
  cacheStorage,
  networkStatus
});
```

For a fully functional example please check react native example app:
https://github.com/aerogear/offix-react-native-example
