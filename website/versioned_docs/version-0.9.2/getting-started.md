---
id: version-0.9.2-getting-started
title: Getting Started
sidebar_label: Getting Started
original_id: getting-started
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
import { OfflineClient } from 'offix-client';

const config = {
  httpUrl: 'http://localhost:4000/graphql'
};

// offlineClient is a wrapper that gives access to an apollo client
const offlineClient = new OfflineClient(config);

// client is the initialized apollo client
const client = await client.init();
```

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
