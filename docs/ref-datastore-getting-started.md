---
id: datastore-getting-started
title: Getting Started
sidebar_label: Getting Started
---

Offix DataStore is a Repository interface for on-device storage.
The DataStore is kept in sync with the server using subscriptions when online and data replication techniques when online.

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

## Using the DataStore inside your application

To work with DataStore, you need to pass your models to DataStore.

```typescript title="/src/datastoreConfig.ts"
import { DataStore } from 'offix-datastore';

export interface Task {
    id?: string;
    title: string;
    description: string;
    numberOfDaysLeft: number;
}

const datastore = new DataStore(DB_NAME);
export const TaskModel = datastore.create<Task>(TASK_STORE_NAME, {
    id: "string",
    title: "string",
    description: "string",
    numberOfDaysLeft: "number"
});
datastore.init();
```

## Schema Upgrades

DataStore internally creates a store for each model on the device. 
When you push a new version of your app with new models or you have removed some models.
The stores for the new models won't be create on the client device and the now unused stores(for removed models)
won't be deleted. To make DataStore acknowledge these changes, you need to increment the schema version.

`DataStore` takes a schema version parameter(defaults to 1). 

```typescript
const dataStore = new DataStore(DB_NAME, 2);
```
