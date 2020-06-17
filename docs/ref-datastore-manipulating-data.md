---
id: datastore-manipulating-data
title: Manipulating Data
sidebar_label: Manipulating Data
---

All interaction is done with the on-device storage.

## Saving data

```typescript
import { save } from 'offix-datastore';

save({
    title: "Write Docs",
    description: "Write Offix Docs",
    __typename: "Task"
}).then((data) => {
    console.log(data); // { id: '...', title, description, __typename  }
})
```

## Querying data

```typescript
import { query } from 'offix-datastore;

query({
    __typename: "Task"
}).then((data) => {}) // Retrieves all tasks
```

Predicate functions are used to filter data

```typescript
query({ 
    title: "",
    __typename: "Task"
}, (p: any) => p.title("eq", "test"))
.then((data) => {}) // Retrieves all tasks where title matches "test"
```

Currently supported operators(more coming soon)
- eq  equality operator
- gt  greater than operator

You can also create predicate expressions

```typescript
query({ 
    title: "",
    numberOfDaysLeft: ""
    __typename: "Task"
}, (p: any) => p.or(
    p.title("eq", "test"),
    p.not(p.numberOfDaysLeft("gt", 4))
)
```
You can create `and`, `or` and `not` expressions

## Updating data

```typescript
import { update } from 'offix-datastore';

update({
    id: "..."
    title: "Write Docs",
    description: "Write Offix Docs",
    __typename: "Task"
})
.then((data) => {
    console.log(data); // updated data
})
```

## Deleting data

```typescript
import { query, remove } from 'offix-datastore';

const task = (await query({ ...selectors }, predicate))[0];
await remove(task);
```

You can also delete data matching predicates

```typescript
await remove({ ...selectors }, (p) => p.numberOfDaysLeft("gt", 4));
```
