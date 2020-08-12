---
id: filters
title: Filtering
sidebar_label: Filtering
---

## Filter Format

```Javascript
{
  [fieldname]: {
    [operator]: value
  },
  [logical operator]: {
    [fieldname]: {
      [operator]: value
    }
  }
}
```


## Operators

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
})
```
