---
id: crud-operations
title: CRUD Operations
sidebar_label: CRUD Operations
---

All interactions are done with the on-device storage.

## Saving data

```typescript
import { TaskModel } from './datastoreConfig';

TaskModel.save({
    title: "Write Docs",
    description: "Write Offix Docs",
}).then((data) => {
    console.log(data); // { id: '...', title, description }
})
```

## Querying data

```typescript
import { TaskModel } from './datastoreConfig';

TaskModel.query().then((data) => {}) // Retrieves all tasks
```

You can filter data using the schema fields defined in the model

```typescript
TaskModel.query({ title: "test" })
.then((data) => {}) // Retrieves all tasks where title matches "test"
```

## Updating data

```typescript
import { TaskModel } from './datastoreConfig';

// update the title of all tasks with title = "test" to "Offix Test"
TaskModel.update({
    title: "Offix Test"
}, { title: "test" })
.then((data) => {
    console.log(data); // updated data
})
```

## Deleting data

```typescript
import { TaskModel } from './datastoreConfig';

// delete all tasks with numberOfDaysLeft greater than 4
await TaskModel.remove({ numberOfDaysLeft: { gt: 4 } });
```
