---
id: datastore-manipulating-data
title: Manipulating Data
sidebar_label: Manipulating Data
---

All interaction is done with the on-device storage.

## Saving data

```typescript
import { TaskModel } from 'datastoreConfig';

TaskModel.save({
    title: "Write Docs",
    description: "Write Offix Docs",
}).then((data) => {
    console.log(data); // { id: '...', title, description }
})
```

## Querying data

```typescript
import { TaskModel } from 'datastoreConfig';

TaskModel.query().then((data) => {}) // Retrieves all tasks
```

Predicate functions are used to filter data

```typescript
TaskModel.query((p: any) => p.title("eq", "test"))
.then((data) => {}) // Retrieves all tasks where title matches "test"
```

Currently supported operators(more coming soon)
- eq  equality operator
- gt  greater than operator

You can also create predicate expressions

```typescript
TaskModel.query((p: any) => p.or(
    p.title("eq", "test"),
    p.not(p.numberOfDaysLeft("gt", 4))
)
```
You can create `and`, `or` and `not` expressions

## Updating data

```typescript
import { TaskModel } from 'datastoreConfig';

TaskModel.update({
    title: "Offix Test"
}, (p: any) => p.title("eq", "test"))
.then((data) => {
    console.log(data); // updated data
})
```

## Deleting data

```typescript
import { TaskModel } from 'datastoreConfig';

await TaskModel.remove((p) => p.numberOfDaysLeft("gt", 4));
```
