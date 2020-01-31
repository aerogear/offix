---
id: react
title: React - using Offix Hooks
sidebar_label: React
---

`ApolloOfflineClient` is compatible with all of the official [Apollo React Hooks](https://www.apollographql.com/docs/react/api/react-hooks/) such as `useQuery`, `useMutation` and `useSubscription`.

The `react-offix-hooks` library provides an additional `useOfflineMutation` React hook for performing offline mutations.

**Note:** `react-offix-hooks` is experimental. Please try it and [log any issues](https://github.com/aerogear/offix/issues/new/choose) to help us improve it.

## App Initialization

In a normal React application that uses Apollo Client, the client is created at startup and the root component is wrapped with `ApolloProvider`.

Because `client.init()` needs to be called and this is an asynchronous function call, an extra step is needed. The root `ApolloProvider` also needs to be wrapped with `ApolloOfflineProvider` for the `useOfflineMutation` hook to work.

Below is a boilerplate example that can be used.

```javascript
import React, { useState, useEffect } from 'react'
import { render } from 'react-dom'

import { ApolloOfflineClient } from 'offix-client'
import { ApolloOfflineProvider } from 'react-offix-hooks'
import { ApolloProvider } from '@apollo/react-hooks'

const client = new ApolloOfflineClient(clientConfig)

const App = () => {
  const [initialized, setInitialized] = useState(false)

  // initialize the offix client and set the apollo client
  useEffect(() => {
    client.init().then(() => setInitialized(true))
  }, [])

  if (initialized) {
    return (
      <ApolloOfflineProvider client={client}>
        <ApolloProvider client={client}>
          <MyRootComponent/>
        </ApolloProvider>
      </ApolloOfflineProvider>
    )
  }
  return <h2>Loading...</h2>
}


render(<App />, document.getElementById('root'))
```

In the example above, the following happens.

1. An `ApolloOfflineClient` is created.
2. `useState()` is used to set a boolean that will be `true` once the client is initialized.
3. `client.init()` is called inside a `useEffect` call making sure the initialization happens only once.
4. If `initialized` is true, then the application is rendered including the `ApolloOfflineProvider` and the `ApolloProvider`. Otherwise a loading screen is shown.

## useOfflineMutation

`useOfflineMutation` is similar to `useMutation` but it internally calls `client.offlineMutate` and it provides additional state that can be used to build UIs that handle offline cases.

```javascript
import gql from 'graphql-tag'
import { useOfflineMutation } from 'react-offix-hooks'

const ADD_MESSAGE_MUTATION = gql`
  mutation addMessage($chatId: String!, $content: String!) {
    addMessage(chatId: $chatId, content: $content)
  }
`

function addMessageForm({ chatId }) {
  const inputRef = useRef()

  const [addMessage, state] = useOfflineMutation(ADD_MESSAGE_MUTATION, {
    variables: {
      chatId,
      content: inputRef.current.value,
    }
  })

  return (
    <form>
      <input ref={inputRef} />
      <button onClick={addMessage}>Send Message</button>
    </form>
  )
}
```

The following properties are available on the `state` returned from `useOfflineMutation`

* `called` - true when the mutation was called.
* `data` - the result of the mutation.
* `error` - error returned from the mutation (not including offline errors).
* `hasError` - true when an error occurred.
* `loading` - true when a mutation is in flight or when an offline mutation hasn't been fulfilled yet.
* `mutationVariables` - the variables passed to the mutation. Only present during an offline mutation.
* `calledWhileOffline` - true when mutation was called while offline.
* `offlineChangeReplicated` - true when offline mutation has been successfully fulfilled.
* `offlineReplicationError` - true when an error happened trying to fulfill an offline mutation `error` will contain the actual error.

Example:

```js
const ADD_TASK = gql`
mutation createTask($description: String!, $title: String!, $status: TaskStatus){
    createTask(description: $description, title: $title, status: $status){
      id
      title
      description
      version
      status
    }
  }
`;

const [addTask, {
    called,
    data,
    error,
    hasError,
    loading,
    mutationVariables,
    calledWhileOffline,
    offlineChangeReplicated,
    offlineReplicationError
  }] = useOfflineMutation(ADD_TASK, {
    variables: {
      description,
      title,
      status: 'OPEN',
      version: 1
    },
    updateQuery: GET_TASKS,
    returnType: 'Task'
  })
```

Before the mutation is called:

```json
{
  "called": false,
  "hasError": false,
  "loading": false,
  "calledWhileOffline": false,
  "offlineChangeReplicated": false
}
```

After the mutation is called while online:

```json
{
  "called": true,
  "data": {
    "createTask": {
      "id": "134",
      "title": "created while online",
      "description": "this is a description",
      "version": 1,
      "status": "OPEN",
      "__typename": "Task"
    }
  },
  "hasError": false,
  "loading": false,
  "calledWhileOffline": false,
  "offlineChangeReplicated": false
}
```

After the mutation is called while offline:

```json
{
  "called": true,
  "hasError": false,
  "loading": true,
  "mutationVariables": {
    "description": "this is a description",
    "title": "created while offline",
    "status": "OPEN",
    "version": 1
  },
  "calledWhileOffline": true,
  "offlineChangeReplicated": false
}
```

After the offline mutation is successfully replayed

```json
{
  "called": true,
  "data": {
    "createTask": {
      "id": "135",
      "title": "created while offline",
      "description": "this is a description",
      "version": 1,
      "status": "OPEN",
      "__typename": "Task"
    }
  },
  "hasError": false,
  "loading": false,
  "calledWhileOffline": true,
  "offlineChangeReplicated": true
}
```

After the offline mutation cannot be replayed

```json
{
  "called": true,
  "error": {
    "graphQLErrors": [],
    "networkError": {},
    "message": "Network error: Failed to fetch"
  },
  "hasError": true,
  "loading": true,
  "mutationVariables": {
    "description": "created while offline",
    "title": "created while offline",
    "status": "OPEN",
    "version": 1
  },
  "calledWhileOffline": true,
  "offlineChangeReplicated": false,
  "offlineReplicationError": {
    "graphQLErrors": [],
    "networkError": {},
    "message": "Network error: Failed to fetch"
  }
```

## useNetworkStatus

In order to detect changes in the network status, the useNetworkStatus hook can be used. The hook returns truth for when the network is online and falsey for when the network is offline. The hook makes use of a network status change listener and will update the returned value on a network status change event.

Example:

```
import React from 'react';
import { useNetworkStatus } from 'react-offix-hooks';

export default App = () => {
  const isOnline = useNetworkStatus();
  return <span>Network status: { isOnline }</span>;
}
```