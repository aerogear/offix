# Offix - React Todo Example App

This example demonstrates how to get started using Offix in a React project. The app is a simple
todo app making use of the `offix-client` and can be used as launch pad to getting started
with Offix and make use of the features in the library.

## Getting started

### Setting up a server

For simplicity, a Graphback runtime server is available in the server folder in the examples directory. Follow the gettings started instructions there to get started quickly.

Alternatively, you can implement your own backend server.

### Starting the client

Next, configure the GraphQL server address in the `src/clientConfig.js` file:

```

...

const wsLink = new WebSocketLink({
  uri: 'ws://<YOUR-SERVER-ADDRESS-HERE>',
  ...
});

const httpLink = new HttpLink({
    uri: 'http://<YOUR-SERVER-ADDRESS-HERE>', 
});

...

```

### Starting the client

Lastly, run the following commands from the React example folder.

```
yarn install
```

```
yarn start
```