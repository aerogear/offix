import { InMemoryCache } from 'apollo-cache-inmemory';
import { split } from 'apollo-link';
import { HttpLink } from 'apollo-link-http';
import { WebSocketLink } from 'apollo-link-ws';
import { getMainDefinition } from 'apollo-utilities';
import { ReactNativeNetworkStatus } from './helpers/ReactNativeNetworkStatus';
import AsyncStorage from '@react-native-community/async-storage'

const wsLink = new WebSocketLink({
  uri: 'ws://192.168.1.10:4000/graphql',
  options: {
    reconnect: true,
    lazy: true,
  },
});

const httpLink = new HttpLink({
  uri: 'http://192.168.1.10:4000/graphql',
});

const link = split(
  ({ query }) => {
    const { kind, operation } = getMainDefinition(query);
    return kind === 'OperationDefinition' && operation === 'subscription';
  },
  wsLink,
  httpLink,
);

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

const networkStatus = new ReactNativeNetworkStatus();

export const clientConfig = {
  link,
  cache: new InMemoryCache(),
  offlineStorage: cacheStorage,
  cacheStorage,
  networkStatus
};
