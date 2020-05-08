---
title: React Native
sidebar_label: React Native
id: react-native
---

To integrate offix in React Native, developers need to provide custom storage and network layers.
We recomend developers to use following React Native plugins:

- `@react-native-community/async-storage` - for storage
- `@react-native-community/netinfo` - for network information

## Integration

To integrate with offix we need to create wrappers for storage and network

```js
import { ApolloOfflineClient } from "offix-client"
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from "apollo-link-http";
import AsyncStorage from "@react-native-community/async-storage"
import NetInfo from "@react-native-community/netinfo"

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
  }
};

// Create network interface
const networkStatus = {
  onStatusChangeListener(callback) {
    const listener = (connected) => {
      callback.onStatusChange({ online: connected })
    };
    NetInfo.isConnected.addEventListener('connectionChange', listener)
  },
  isOffline() {
    return NetInfo.isConnected.fetch().then(connected => !connected)
  }
};

// Create client
const offlineClient = new ApolloOfflineClient({
  cache: new InMemoryCache(),
  link: new HttpLink({ uri: 'http://localhost:4000/graphql' }),
  offlineStorage: cacheStorage,
  cacheStorage,
  networkStatus
});
```

For fully functional example please check react native example app:
https://github.com/aerogear/offix-react-native-example
