import React, { useState, useEffect } from 'react';
import { ApolloOfflineClient } from 'offix-client';
import { ApolloOfflineProvider } from 'react-offix-hooks';
import { ApolloProvider } from '@apollo/react-hooks';
import App from './App';
import { Loading } from './components';
import { clientConfig } from './clientConfig';

const client = new ApolloOfflineClient(clientConfig);

export const Offix = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    client.init().then(() => setInitialized(true));
  }, []);

  // If client is still initializing,
  // display loading screen
  if (!initialized) return <Loading />;

  return (
    <ApolloOfflineProvider client={client}>
      <ApolloProvider client={client}>
        <App />
      </ApolloProvider>
    </ApolloOfflineProvider>
  );
};
