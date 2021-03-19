---
id: edits
title: Edits
sidebar_label: Edits
---

## Saving Data

The DataStore Models provides two methods to save data;

* `save()`
* [saveOrUpdate()](#save-or-update)

`save()` generates a primary key (in this case, an `id`), if one is not provided.

```typescript
import { TaskModel } from './datastoreConfig';

TaskModel.save({
    title: "Write Docs",
    description: "Write Offix Docs",
}).then((data) => {
    console.log(data); // { _id: '...', title, description }
})
```

## Updating Data

```typescript
import { TaskModel } from './datastoreConfig';

// update the title of task to "Offix Test"
TaskModel.updateById({
    _id: documentId
    title: "Offix Test"
})
.then((data) => {
    console.log(data); // updated data
})
```

### Save Or Update

The DataStore provides a `saveOrUpdate` method to use for upserts.
If the primary key(in this case an `id`) is provided, the DataStore will
try to update the existing document if it exists, if it does not exist
or no primary key was provided, the DataStore saves the data as a new document.

```typescript
TaskModel.saveOrUpdate({
    _id: documentId
    title: "Offix Test"
})
.then((data) => {
    console.log(data); // updated data
})
```

## Deleting Data

```typescript
await TaskModel.removeById(documentId);
```
