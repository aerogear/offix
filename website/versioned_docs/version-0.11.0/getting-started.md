---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

## Install Offix

Using [npm](https://www.npmjs.com/package/offix-client):

```shell
npm install offix-client
```

Or [yarn](https://yarnpkg.com/en/package/offix-client):

```shell
yarn add offix-client
```

## Importing the package

```javascript
import { ApolloOfflineClient } from 'offix-client';
import { InMemoryCache } from 'apollo-cache-inmemory';

const config = {
  httpUrl: 'http://localhost:4000/graphql',
  cache: new InMemoryCache()
};

// create the client
const client = new ApolloOfflineClient(config);

// initialise the client
await client.init();
```

The `ApolloOfflineClient` is a full `ApolloClient` but with some additional features for building offline workflows.

**Note** `client.init` must be resolved before the application makes any queries/mutations, otherwise the cache and storage mechanisms may not work properly.

## Example Mutation

The following example shows the `client.offlineMutate()` method which schedules mutations while the application is considered offline. 

```js
const options = {
  mutation: gql`
    mutation greeting($name: String!){
    greeting(name: $name) {
      body
    }
  }`,
  variables: {
    name: 'hello world!'
  }
};

client.offlineMutate(options).catch((error) => {
  // we are offline - lets wait for changes
  if(error.offline) {
    error.watchOfflineChange().then((result) => {
      console.log('mutation was completed after we came back online!', result)
    })
  }
});
```

When offline, an error is returned with a reference to a promise which can be used to wait for the mutation to complete. This will happen when the application comes back online.

`async/await` can be used too.

```js
try {
  await client.offlineMutate(options)
} catch(error) {
  if(error.offline) {
    const result = await error.watchOfflineChange()
    console.log('mutation was completed after we came back online!', result)
  }
}
```

## Basic concepts

OfflineClient is based on Apollo GraphQL client and can be used with various web and mobile frameworks.
We provide a version for web and Apache Cordova. For basic concepts about Apollo GraphQL please refer to the documentation for your own platform.

For React:
https://www.apollographql.com/docs/react/

For Angular:
https://www.apollographql.com/docs/angular/
