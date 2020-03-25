# Offix - React Native Todo Example App

This example demonstrates how to get started using Offix in a React Native project. The app is a simple
todo app making use of the `offix-client` and can be used as launch pad to getting started
with Offix and make use of the features in the library.

## Getting started

To get started, run:

```
yarn install
```

Follow the React Native [getting started](https://reactnative.dev/docs/getting-started) guide, if you have not setup React Native already. 

Note: this example app uses the React Native CLI and not Expo.

### Setting up a server

For simplicity, a GraphQL Serve in-memory server has been provided. You can make changes to the GrapQL schema, by editing the `models/runtime.graphql` file. To start the server, run the following
command:

```
yarn serve
```

Alternatively, you can implement your own backend server.

### Starting the client

Next, configure the GraphQL server address in the `src/clientConfig.js` file:

```

...

// Note for android build, you will need
// the IP address for localhost,
// usually 192.168.1.10:<PORT_NUMBER>
const wsLink = new WebSocketLink({
  uri: 'ws://<YOUR-SERVER-ADDRESS-HERE>',
  ...
});

// Note for android build, you will need
// the IP address for localhost,
// usually 192.168.1.10:<PORT_NUMBER>
const httpLink = new HttpLink({
    uri: 'http://<YOUR-SERVER-ADDRESS-HERE>', 
});

...

```

### Starting the client

Lastly, run the following commands from the React example folder.

```
yarn

yarn start
```

To run ios: 
```
yarn ios
```

Or for Android:
```
yarn android
```