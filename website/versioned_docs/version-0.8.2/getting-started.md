---
id: version-0.8.2-getting-started
title: Getting Started
sidebar_label: Getting Started
original_id: getting-started
---

## Importing the package

```javascript
import { OfflineClient } from 'offix-client';
```

## Configuration

To provide custom configuration to the client, the following options are available. If you wish, these are also available by using the `OffixClientConfig` interface from the SDK.

```javascript
let config = {
  httpUrl: 'http://localhost:4000/graphql',
  wsUrl: 'ws://localhost:4000/graphql'
};
```

## Creating a Client

```javascript
let client = new OfflineClient(config);
client.init();
```

## Basic concepts

OfflineClient is based on Apollo GraphQL client and can be used with various web and mobile frameworks.
We provide a version for web and Apache Cordova. For basic concepts about Apollo GraphQL please refer to the documentation for your own platform.

For React:
https://www.apollographql.com/docs/react/

For Angular:
https://www.apollographql.com/docs/angular/
