---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

Offix can be used with existing Apollo GraphQL applications as an extension to the Apollo Client.
The Offix Client provides additional methods that support various offline use cases. 

Offix supports multiple platforms by extendable javascript library and individual wrappers for 
specific web and cross platform frameworks. 


## Installing Offix Client

Using [npm](https://www.npmjs.com/package/offix-client):

```shell
npm install offix-client
```

Or [yarn](https://yarnpkg.com/en/package/offix-client):

```shell
yarn add offix-client
```

## Using the Client inside your application

To work with Offix you should create Offix client. 

> NOTE: Offix client extends Apollo Client - if you already using Apollo Client you would need to 
swap it with the Offix client implementation

```javascript
import { ApolloOfflineClient } from 'offix-client';
import { InMemoryCache } from 'apollo-cache-inmemory';
import { HttpLink } from "apollo-link-http";

const config = {
  link: new HttpLink({ uri: 'http://example.com/graphql' })
  cache: new InMemoryCache()
};

// create the client
const client = new ApolloOfflineClient(config);

// initialise the client
// Client needs to be installised before any other queries and mutations will happen.
// Please see platform guide to see how this can be done in React, Angular etc.
await client.init();
```

The `ApolloOfflineClient` is a full `ApolloClient` but with some additional features for building offline workflows.

**Note** `client.init` must be resolved before the application makes any queries/mutations, otherwise the cache and storage mechanisms may not work properly.

## Offix Client Boost

The `offix-client-boost` is a convenient way to create a client already bundled with all you need to work with GraphQL. 
Mainly a cache and [Apollo Links](https://www.apollographql.com/docs/link/) subscriptions and file uploads.
Offix Boost is recomended if you trying to build your first GraphQL application and want to have seamless experience.

```js
import { createClient } from 'offix-client-boost'

const config = {
  httpUrl: 'http://example.com/graphql',
  wsUrl: 'ws://example.com/graphql'
}

const client = await createClient(config)
```

## Working with client

Client will offer the same API as Apollo GraphQL client.
Offix will supply additional methods that help with offline experience.

The following example shows the `client.offlineMutate()` method which support sending new mutation while the application is considered offline. 

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

## Non Offline realated API

`ApolloOfflineClient` is an extension of the Apollo GraphQL client and can be used with various web and mobile frameworks.
For basic concepts about Apollo GraphQL please refer to the documentation for your own platform.

For React:
https://www.apollographql.com/docs/react/

For Angular:
https://www.apollographql.com/docs/angular/
