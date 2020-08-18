---
id: queries
title: Queries
sidebar_label: Queries
---

DataStore Models provides two functions for executing queries.

- [query()](#query)
  - [Operators](#operators)
- [queryById()](#querybyid)

## query()

Here we can fetch all documents for a Model or a selection
of the documents using filters.

```typescript
import { TaskModel } from './datastoreConfig';

TaskModel.query().then((data) => {}) // Retrieves all tasks
```

In the code snippet above, we fetch all tasks. To fetch a
selection of the documents we can use filters.
We filter using expressions and operators.

### Operators

All supported operators:

- 'ne' - Is value not equal to input
- 'eq' - Is value equal to input
- 'le' - Is value less than or equal to input
- 'lt' - Is value strictly less than input
- 'ge' - Is value greater than or equal to input
- 'gt' - Is value strictly greater than input
- 'in' - Does input array or string contain value
- 'contains' - Is the input contained in value
- 'startsWith' - Does value start with input
- 'endsWith' - Does value end with input


Mathematical operators supported:

- 'ne'
- 'eq'
- 'le'
- 'lt'
- 'ge'
- 'gt'
- 'in'

String Operators supported:

- 'ne'
- 'eq'
- 'le'
- 'lt'
- 'ge'
- 'gt'
- 'in'
- 'contains'
- 'startsWith'
- 'endsWith'

Date Operators supported:

- 'ne'
- 'eq'
- 'le'
- 'lt'
- 'ge'
- 'gt'
- 'in'

Array Operators:

- 'ne'
- 'eq'
- 'in'
- 'contains'

Boolean Operators: 

- 'ne'
- 'eq'
- 'in'

Examples:

```typescript
TaskModel.query({ title: "test" }); // Fetch all tasks where title = 'test' 

TaskModel.query({
    title: { ne: 'test' }
}); // Fetch all tasks where title != 'test'

TaskModel.query({
    numberOfDaysLeft: {
        ge: 5, lt: 20
    }
}); // Fetch all tasks where numberOfDaysLeft >= 5 and < 20

TaskModel.query({
    title: 'test',
    numberOfDaysLeft: { gt: 5 }
}); // Fetch all tasks where title = 'test' and numberOfDaysLeft > 5
```

You can also create expressions with the following logical operators:

* AND
* OR
* NOT

```typescript
TaskModel.query({
  or: {
    title: "test",
    not: { numberOfDaysLeft: { gt: 5 } }
  }
}); // Fetch all tasks where (title = 'test') or (numberOfDaysLeft is not > 5)
```

## queryById()

Here we fetch documents using their primary key.
Quering by Id is faster because DataStore index documents by their primary key.

```typescript
const task = await TaskModel.queryById(documentId);
```