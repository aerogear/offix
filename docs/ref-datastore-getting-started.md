---
id: datastore-getting-started
title: Getting Started
sidebar_label: Getting Started
---

Offix DataStore is a Repository interface for on-device storage.
The DataStore is kept in sync with the server using subscriptions when online and data replication techniques when online.

Currently, Offix DataStore can only be used locally with support for synchronization coming soon.

## Installing Offix DataStore

Not published yet!

## Using the DataStore inside your application

To work with DataStore, you need to pass your models to DataStore and allow it setup stores for each model.

```typescript
import { configure } from 'offix-datastore';

configure([
    { __typename: "Task" }
]);
```

`configure` also takes a schema version parameter(defaults to 1). When pushing a new version of your app increment the schema version. This will allow DataStore to removed outdated stores and add new ones.

```typescript
configure([
    { __typename: "Task" }
], 2);
```
