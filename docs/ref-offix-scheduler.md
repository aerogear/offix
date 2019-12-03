---
id: offix-scheduler-introduction
title: Offix Scheduler Introduction
sidebar_label: Offix Scheduler
---

Offix Scheduler is the core component that delivers the offline queueing and storage in packages such as `offix-client`. The scheduler can be used in an application directly to build offline workflows, or it can be as the foundation to build new packages and clients with offline functionality.

Unlike `offix-client` which provides many features out of the box, `offix-scheduler` provides a lower level set of core functionalities which can be used to build offline experiences.

* `NetworkStatus` interface for defining when an app is and is not offline.
* `Executor` interface for defining the operations/behaviour to be scheduled. Example: A HTTP request, sending a message, a GraphQL request.
* Offline queue mechanism where all operations are scheduled and fulfilled in order.
* `OfflineQueueListener` functions that are called at various stages in the queue lifecycle. Can be used to extend the queue with additional behaviour.
* Offline storage mechanism for persisting operations in the queue and restoring them after application restarts.

See [Offix-Client](./getting-started.md) for a fully featured implementation that uses the Offix Scheduler.


## Installation

Using [npm](https://www.npmjs.com/package/offix-scheduler):

```shell
npm install offix-scheduler
```

Or [yarn](https://yarnpkg.com/en/package/offix-scheduler):

```shell
yarn add offix-scheduler
```

## Getting Started Example

This example shows how `offix-scheduler` could be used to schedule HTTP Requests using the `fetch` API found in most browsers. 

### Executor

An `Executor` is a class or an object with an `execute` method that will be called by the scheduler. This is the core operation/behaviour to be scheduled while offline. In this example we will define a `FetchExecutor` class that can make requests using `fetch`.

```js
class FetchExecutor {
  // You could pass in some state and initialize it within the constructor
  constructor() {}

  // The execute function where the http request is made
  // options is an object which can contain any properties
  // you wish to pass in.
  public async execute(options) {

    // in this example options will have a url and a body
    const { url, body } = options;

    // make the request
    const res = await fetch(url, {
      method: "post",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });

    // return the result
    return res.json();
  }
}
```

The `execute` method defines the business logic to be scheduled. In this example, we're scheduling HTTP `POST` requests using the `fetch` API. `execute` accepts an `options` object which can contain any properties needed to perform the operation. In this case `execute` expects the options to have a `url` which is where we will send the request and a `body` which will be the body of the request.

This example is simplified as a realistic example would likely need to handle more options and also various error cases.

### Initialize the `OffixScheduler`

The example below shows how to initialize the `OffixScheduler` with the `Executor` we defined above.

```js
const offix = new OffixScheduler({
  executor: new FetchExecutor()
});

await offix.init();
```

### Schedule an Operation

To schedule an operation, call `execute` on the scheduler and pass down any options needed by the `Executor`.

```js
try {
  // if online the result is immediately returned
  const result = await offix.execute({
    url: "http://example.com/tasks",
    body: {
      title: "A New Task!",
      description: "This was created by Offix Scheduler"
    }
  });
} catch (err) {
  // check if an offline error occurred and wait for the result.
  if (err.offline) {
    const result = await err.watchOfflineChange();
  }
}
```







