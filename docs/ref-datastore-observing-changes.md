---
id: datastore-observing-changes
title: Observing Changes
sidebar_label: Observing Changes
---

```typescript
import { observe } from 'offix-datastore';

observe({ __typename: "Task" }, (event) => {
    console.log(event); // { operationType, data }
});
```
