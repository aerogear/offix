---
id: datastore-manipulating-data
title: Manipulating Data
sidebar_label: Manipulating Data
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

You can use predicate functions to filter data using the schema fields defined in the model

```typescript
TaskModel.query((p) => p.title("eq", "test"))
.then((data) => {}) // Retrieves all tasks where title matches "test"
```

Supported operators
- 'ne' - Is value not equal to input
- 'eq' - Is value equal to input
- 'le' - Is value less than or equal to input
- 'lt' - Is value strictly less than input
- 'ge' - Is value greater than or equal to input
- 'gt' - Is value strictly greater than input
- 'in' - Does input array or string contain value
- 'contains' - Is the input contained in value(array or string)
- 'startsWith' - Does value start with input string
- 'endsWith' - Does value end with input string

You can also create expressions with the following logical operators  
`and | or | not`

```typescript
TaskModel.query((p) => p.or(
    p.title("eq", "test"),
    p.not(p.numberOfDaysLeft("gt", 4))
)
```

## Updating data

```typescript
import { TaskModel } from './datastoreConfig';

// change update the title of all tasks with title = "test" to "Offix Test"
TaskModel.update({
    title: "Offix Test"
}, (p) => p.title("eq", "test"))
.then((data) => {
    console.log(data); // updated data
})
```

## Deleting data

```typescript
import { TaskModel } from './datastoreConfig';

// delete all tasks with numberOfDaysLeft greater than 4
await TaskModel.remove((p) => p.numberOfDaysLeft("gt", 4));
```
