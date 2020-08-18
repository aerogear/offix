---
id: queries
title: Queries
sidebar_label: Queries
---

The DataStore Models provides two functions for executing queries.

- [query()](#query)
  - [Operators](#operators)
- [queryById()](#querybyid)

## query()

Here we can fetch all documents for a Model or a selection
of the documents using filters.

```typescript
TaskModel.query().then((data) => {}) // Retrieves all tasks
```

In the code snippet above, we fetch all tasks. To fetch a
selection of the documents we can use filters.
We filter using expressions and operators.

### Operators

All supported operators:

| Operator   | Value                                    |
| ---------- |----------------------------------------- |
| ne         | Input not equal to value                 |
| eq         | Input equal to value                     |
| le         | Input less than or equal to value        |
| lt         | Input less than (strict) value           |
| ge         | Input greater than or equal to value     |
| gt         | Input greater than (strict) value        |
| in         | Input array or string contained in value |
| contains   | Value starts with input                  |
| startsWith | Value starts with input                  |
| endsWith   | Value ends with input                    |

### Operator support:

| Operator   | Mathematical             | String             | Date                     | Array                    | Boolean                  |
| ---------- | :----------:             | :----------------: | :----------------------: | :----------------------: | :----------------------: |
| ne         | :heavy_check_mark:       | :heavy_check_mark: | :heavy_check_mark:       | :heavy_check_mark:       | :heavy_check_mark:       |
| eq         | :heavy_check_mark:       | :heavy_check_mark: | :heavy_check_mark:       | :heavy_check_mark:       | :heavy_check_mark:       |
| le         | :heavy_check_mark:       | :heavy_check_mark: | :heavy_check_mark:       | :heavy_multiplication_x: | :heavy_multiplication_x: |
| lt         | :heavy_check_mark:       | :heavy_check_mark: | :heavy_check_mark:       | :heavy_multiplication_x: | :heavy_multiplication_x: |
| ge         | :heavy_check_mark:       | :heavy_check_mark: | :heavy_check_mark:       | :heavy_multiplication_x: | :heavy_multiplication_x: |
| gt         | :heavy_check_mark:       | :heavy_check_mark: | :heavy_check_mark:       | :heavy_multiplication_x: | :heavy_multiplication_x: |
| in         | :heavy_check_mark:       | :heavy_check_mark: | :heavy_check_mark:       | :heavy_check_mark:       | :heavy_check_mark:       |
| contains   | :heavy_multiplication_x: | :heavy_check_mark: | :heavy_multiplication_x: | :heavy_check_mark:       | :heavy_multiplication_x: |
| startsWith | :heavy_multiplication_x: | :heavy_check_mark: | :heavy_multiplication_x: | :heavy_check_mark:       | :heavy_multiplication_x: |
| endsWith   | :heavy_multiplication_x: | :heavy_check_mark: | :heavy_multiplication_x: | :heavy_check_mark:       | :heavy_multiplication_x: |

### Examples:

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