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

### Building your own GraphQL type

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

### Datastore Models

To be able to store user tasks in DataStore, you need to create its DataStore model.
The DataStore model provides the API to perform CRUD operations on `Task` in the DataStore.
The [cli tool](cli.md) generates code configure each model defined in your graphql schema.
Here we will assume that you generated the DataStore config files in `src/datastore`.

If you are using Typescript and you want your model to have types, you can create an interface;

```typescript title="/src/datastore/types.ts"
export interface Task {
    id?: string;
    title: string;
    description: string;
    numberOfDaysLeft: number;
}
```

and instantiate the `TaskModel` with the `Task` interface in the generated config file.

```typescript
import { DataStore } from "offix-datastore";
import schema from "./schema";
import { Task } from "./types";

const datastore = new DataStore({
  dbName: "offix-datastore",
  replicationConfig: {
    client: {
      url: "http://localhost:4000/graphql",
      wsUrl: "ws://localhost:4000/graphql",
    }
  }
});

export const TaskModel = datastore.setupModel<Task>(schema.Task);

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
