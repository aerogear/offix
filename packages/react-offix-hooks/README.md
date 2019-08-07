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
    Hello
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
    offixClient.init().then((client) => {
      console.log('offline client initialized')
      setApolloClient(client)
    })
  }, [])

  if (apolloClient) {
    return (
      <OffixProvider client={offixClient}>
        <ApolloProvider client={apolloClient}>
          Hello
        </ApolloProvider>
      </OffixProvider>
    )
  }
  return <h2>Loading...</h2>
}


render(<App />, document.getElementById('root'))
```

# useOfflineMutation

Todo
