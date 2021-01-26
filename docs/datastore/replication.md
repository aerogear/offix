---
id: replication
title: Replication
sidebar_label: Replication
---

Offix DataStore replication requires a manual start. This makes it possible to
bind filters at a later stage. An example of this would be to filter `Todo` items
based on the user id of a signed in user. The datastore allows replication to be started
globally for all models or model by model.

## Global initiation

Once the `DataStore` has been initialised, you can call the start replication
method:

```typescript

datastore.startReplication()

```

## Model-based Initiation

Alternatively, replication can be started one model at a time. The model's
`startReplication` method also accepts an optional `filter` parameter:

```typescript

const filter = {
  userId: { eq: user._id }
};
TodoModel.startReplication(filter)

```

