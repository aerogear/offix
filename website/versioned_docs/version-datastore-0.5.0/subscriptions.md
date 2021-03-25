---
id: subscriptions
title: Subscribing to Changes
sidebar_label: Subscriptions
---

## Change Events

You can listen for change events on your local store.
Each event carries a type and data changed by the event.

The change events that can occur are;
- `ADD` data is added to the Store.  The event payload is the saved data
- `UPDATE` data is updated in the Store. The event payload is the updated data
- `DELETE` data is removed from the Store. The event payload is the removed data

You can subscribe to all change events on a Model.

```typescript
import { CRUDEvents } from 'offix-datastore';

TaskModel.on((event) => {
    console.dir(event); // { eventType, data }
});
```

You can also subscribe to specific events

```typescript
import { CRUDEvents } from 'offix-datastore';

TaskModel.on((event) => {
    console.dir(event); // { eventType, data }
}, [CRUDEvents.ADD]);
```
