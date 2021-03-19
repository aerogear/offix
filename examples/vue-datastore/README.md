# vue-datastore

## Project setup

```
yarn install
```

### Compiles and hot-reloads for development

```
yarn serve
```

### Compiles and minifies for production

```
yarn build
```

### Lints and fixes files

```
yarn lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).

# Offix - Vue3 Todo Example App

This example demonstrates how to get started using Offix in a Vue project. The app is a simple
todo app making use of the `offix-client` and can be used as launch pad to getting started
with Offix and make use of the features in the library.

## Getting started

To get started, run:

```
yarn install
```

### Setting up a server

For simplicity, a GraphQL Serve in-memory server has been provided. You can make changes to the GrapQL schema, by editing the `models/runtime.graphql` file. To start the server, run the following
command:

```
yarn startServer
```

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
yarn start
```

## Adding more models

1. Edit runtime.graphql file in `src/model/runtime.graphql`
2. Generate models yarn generate
3. Review new models

## Running as native capacitor application

yarn build
yarn cap add ios
yarn cap copy ios
yarn cap open ios

yarn build
yarn cap add android
// Swap main activity https://github.com/capacitor-community/sqlite
yarn cap copy android
yarn cap open android
