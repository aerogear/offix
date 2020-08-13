---
id: observing-changes
title: Subscribing to Local changes
sidebar_label: Subscribing to Local changes
---

## Change Events

You can listen for change events on your local store.
Each event carries a type and data changed by the event.

The change events that can occur are;
- `ADD` data is added to the Store. This event carries the saved data
- `UPDATE` data is updated in the Store. The event carries the updated data
- `DELETE` data is removed from the Store. The event contains the removed data

```typescript
import { TaskModel, CRUDEvents } from 'datastoreConfig';

TaskModel.on(CRUDEvents.ADD, (event) => {
    console.dir(event); // { eventType, data }
});
```