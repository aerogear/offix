---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

## Installing Offix DataStore

Using [npm](https://www.npmjs.com/package/offix-datastore):

```shell
npm install offix-datastore
```

Or [yarn](https://yarnpkg.com/en/package/offix-datastore):

```shell
yarn add offix-datastore
```

## Using DataStore

### Sample GraphQL Schema

Let's use the following sample schema for our app

```
type Task {
    id: ID!
    title: String
    description: String
    numberOfDaysLeft: Number
}

```

### Configuring Datastore

We have a [cli tool](cli.md) that generates DataStore config and Model JSON schema given a GraphQL schema.
`DataStore` accepts a config object and an optional `CustomEngines`, see [api reference](datastore-api).

### Datastore Models

To be able to store user tasks in DataStore, you need to create its DataStore model.
The DataStore model provides the API to perform CRUD operations on `Task` in the DataStore.

Let's create the Task DataStore model.

* Define its json schema. See [json schema reference](model-api#Model-Json-Schema)

```JSON title="/src/schema.json"
{
  "Task": {
    "name": "Task",
    "version": 1,
    "type": "object",
    "primaryKey": "id",
    "properties": {
      "id": {
        "type": "string",
        "key": "id",
        "isRequired": true,
        "index": true,
        "primary": true
      },
      "title": {
        "type": "string",
        "key": "title"
      },
      "numberOfDaysLeft": {
        "type": "number",
        "key": "numberOfDaysLeft"
      }
    }
  },
  ...
}
```

* Define its `interface`

```typescript title="/src/datastoreConfig.ts"
import { DataStore } from 'offix-datastore';

export interface Task {
    id?: string;
    title: string;
    description: string;
    numberOfDaysLeft: number;
}
```

* Instantiate the `TaskModel` with the `Task` interface and its json schema.
We will put all our datastore related config in "/src/datastoreConfig.ts"

```typescript title="/src/datastoreConfig.ts"
import { DataStore, DataSyncJsonSchema } from "offix-datastore";
import schema from "./schema.json";

const datastore = new DataStore({
  dbName: "offix-datastore",
  replicationConfig: {
    client: {
      url: "http://localhost:4000/graphql",
      wsUrl: "ws://localhost:4000/graphql",
    },
    delta: { enabled: true },
    mutations: { enabled: false },
    liveupdates: { enabled: false }
  }
});

export const TaskModel = datastore.setupModel<Task>(schema.Task as DataSyncJsonSchema<Task>);
```

* Initialize the datastore

```typescript title="/src/datastoreConfig.ts"
datastore.init();
```

## Schema Upgrades

DataStore creates a table on the device for each model. 
When you push a new version of your app with models added, replaced or removed,
the tables for the new models won't be created on the client device and the unused tables(for removed models)
won't be deleted.

To make DataStore acknowledge these changes, you need to increment the schema version.

Using our sample app, suppose we add a `SubTask` model, we need to increment 
the schema version to trigger the creation of the "user_SubTask" table on the client device.

The `DataStore` constructor takes a schema version parameter(defaults to 1). 

```typescript
const dataStore = new DataStore({
  ...,
  schemaVersion: 2
});
```
