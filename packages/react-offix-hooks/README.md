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

  const [addMessage] = useOfflineMutation(ADD_MESSAGE_MUTATION, {
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
