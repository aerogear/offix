---
id: getting-started
title: Getting Started
sidebar_label: Getting Started
---

Offix DataStore is a Repository interface for on-device storage.
GraphQL is used to synchronize the server and the local device storage.

Currently, Offix DataStore can only be used locally with support for synchronization coming soon.

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

### Sample Schema

Let's use the following sample schema for our app

```
type Task {
    id: ID!
    title: String
    description: String
    numberOfDaysLeft: Number
}

```

### Create Models

To be able to store user tasks in DataStore, you need to create its DataStore model.
The DataStore model provides the API to perform CRUD operations on `Task` in the DataStore.

Let's create the Task DataStore model.

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

* Use DataStore's create method to instantiate the `TaskModel` with the `Task` interface and schema fields.
We will put all our datastore related config in "/src/datastoreConfig.ts"

```typescript title="/src/datastoreConfig.ts"
const DB_NAME = "offix-datastore";
const TASK_TABLE_NAME = "user_Task";

const datastore = new DataStore(DB_NAME);
export const TaskModel = datastore.createModel<Task>(TASK_TABLE_NAME, {
    id: {
        type: "ID", // GraphQL Type
        key: "id" // GraphQL key
    },
    title: { type: "String", key: "title" },
    description: { type: "String", key: "description" },
    numberOfDaysLeft: { type: "Number", key: "numberOfDaysLeft" }
});
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
const dataStore = new DataStore(DB_NAME, 2);
```

## Using the CLI tool

We provide a graphback plugin to generate required config for datastore.
Read about graphback-cli [here](https://graphback.dev/docs/cli/graphback-cli).
The plugin generates a `schema.json` for models annotated with `@datasync-client` in your graphql schema.
Also, a `config.ts` file that instantiates all the models with default settings is generated.
You can import models from `config.ts` and start coding! 

### Installing the plugin

For npm
`npm install offix-datasync-client-plugin`
or yarn
`yarn add offix-datasync-client-plugin`

Add the plugin to your `.graphqlrc.yml`

```
schema: './src/schema.graphql'
extensions:
  graphback:
    # path to data model file(s)
    model: './src/model/runtime.graphql'
    plugins:
      offix-datasync-client-plugin:
        modelOutputDir: './src/datasync'
```

#### Plugin Options

`modelOutputDir` - The path to the folder where the generated config files will be saved.
This folder will be created if it doesn't exist.
