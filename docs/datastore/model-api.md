---
id: model-api
title: Model
sidebar_label: Model
---

The `Model` object exposes CRUD capabilities for a model.

### model.save

Accepts an input and returns a `Promise` of the saved result.
It saves the input to the store for the current model. It fires a `CRUDEvents.ADD` when complete.


### model.query

Accepts an optional `Filter` argument and returns a Promise of the all documents that match the filter or all documents if no filter is specified.

### model.update

Accepts an input which is the update to be made. It also accepts an optional
`Filter` argument. The update will be applied to all documents of the current
model that match the input filter. If no filter is specified, the update will be
applied to all documents of the model. It returns a Promise of the changed
documents. It fires a `CRUDEvents.UPDATE` when complete.

### model.remove

Deletes all documents of the model that match the input `Filter` or
all documents of the model if no filter is specified. It fires a `CRUDEvents.DELETE` when complete.


### model.subscribe

Accepts a [CRUDEvent](storage-api#CRDUEvents) and a callback.
The callback is called with a [StoreChangeEvent](storage-api#StoreChangeEvent)
when the specified `CRUDEvent` is fired.


## Model JSON Schema

| Input | Type | Description |
| ----- | ---- | ----------- |
| name | string | TODO |
| namespace | ?string | TODO |
