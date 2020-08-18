---
id: subscriptions
title: Subscribing to Changes
sidebar_label: Subscriptions
---

## Change Events

You can listen for change events on your local store.
Each event carries a type and data changed by the event.

The change events that can occur are;
- `ADD` data is added to the Store. This event carries the saved data
- `UPDATE` data is updated in the Store. The event carries the updated data
- `DELETE` data is removed from the Store. The event contains the removed data

```typescript
import { CRUDEvents } from 'offix-datastore';

TaskModel.on(CRUDEvents.ADD, (event) => {
    console.dir(event); // { eventType, data }
});
```
