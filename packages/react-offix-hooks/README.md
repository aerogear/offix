## react-offix-hooks

Use `offix-client` in React hooks.

Documentation:

https://offix.dev

# API

## OffixProvider

```javascript
import React from 'react'
import { render } from 'react-dom';

import { OfflineClient } from 'offix-client'
import { OffixProvider } from 'react-offix-hooks'

const offixClient = new OfflineClient(config)

const App = () => (
  <OffixProvider client={offixClient}>
    <MyRootComponent/>
  </OffixProvider>
)

render(<App />, document.getElementById('root'))
```

## Usage With react-apollo-hooks

```javascript
import React, { useState, useEffect } from 'react'
import { render } from 'react-dom';

import { OfflineClient } from 'offix-client'
import { OffixProvider } from 'react-offix-hooks'
import { ApolloProvider } from 'react-apollo-hooks'

const offixClient = new OfflineClient(clientConfig)

const App = () => {
  const [apolloClient, setApolloClient] = useState(null)

  // initialize the offix client and set the apollo client
  useEffect(() => {
    offixClient.init().then(setApolloClient)
  }, [])

  if (apolloClient) {
    return (
      <OffixProvider client={offixClient}>
        <ApolloProvider client={apolloClient}>
          <MyRootComponent/>
        </ApolloProvider>
      </OffixProvider>
    )
  }
  return <h2>Loading...</h2>
}


render(<App />, document.getElementById('root'))
```

# useOfflineMutation

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
* `data` - result of the mutation.
* `error` - error returned from the mutation (not including offline errors).
* `hasError` - true when an error occurred.
* `loading` - true when a mutation is in flight or when an offline mutation hasn't been fulfilled yet.
* `mutationVariables` - the variables passed to the mutation. Only present during an offline mutation.
* `calledWhileOffline` - true when mutation was called while offline.
* `offlineChangeReplicated` - true when offline mutation has been successfully fulfilled.
* `offlineReplicationError` - true when an error happened trying to fulfill an offline mutation `error` will contain the actual error.


```js
const [addMessage, {
    called, // true when the mutation was called
    data, // result of the mutation
    error, // error returned from the mutation (not including offline errors)
    hasError, // true when an error occurred
    loading, // true when a mutation is in flight or when an offline mutation hasn't been fulfilled yet
    mutationVariables, // the variables passed to the mutation. Only present during an offline mutation
    calledWhileOffline, // true when mutation was called while offline
    offlineChangeReplicated, // true when offline mutation has been successfully fulfilled
    offlineReplicationError // true when an error happened trying to fulfill an offline mutation `error` will contain the actual error
  }] = useOfflineMutation(ADD_MESSAGE_MUTATION, {
    variables: {
      chatId,
      content: inputRef.current.value,
    }
  })
```

```
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

before mutation is called

```
{ "called": false, "hasError": false, "loading": false, "calledWhileOffline": false, "offlineChangeReplicated": false }
```

after mutation is called while online

```
{ "called": true, "data": { "createTask": { "id": "134", "title": "created while online", "description": "this is a description", "version": 1, "status": "OPEN", "__typename": "Task" } }, "hasError": false, "loading": false, "calledWhileOffline": false, "offlineChangeReplicated": false }
```

after mutation is called while offline

```
{ "called": true, "hasError": false, "loading": true, "mutationVariables": { "description": "this is a description", "title": "created while offline", "status": "OPEN", "version": 1 }, "calledWhileOffline": true, "offlineChangeReplicated": false }
```

after offline mutation is successfully replayed

```
{ "called": true, "data": { "createTask": { "id": "135", "title": "created while offline", "description": "this is a description", "version": 1, "status": "OPEN", "__typename": "Task" } }, "hasError": false, "loading": false, "calledWhileOffline": true, "offlineChangeReplicated": true }
```