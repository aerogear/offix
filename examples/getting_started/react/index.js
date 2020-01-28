import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ApolloOfflineClient } from 'offix-client';
import { ApolloOfflineProvider } from 'react-offix-hooks';
import { ApolloProvider } from '@apollo/react-hooks';
import App from './App';
import Loading from './components/Loading';
import config from './config';

const client = new ApolloOfflineClient(config);

const Main = () => {
  
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
        <App client={client} />
      </ApolloProvider>
    </ApolloOfflineProvider>
  );
};

ReactDOM.render(<Main />, document.getElementById('app'));
