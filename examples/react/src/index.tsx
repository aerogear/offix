import React from 'react';
import ReactDOM from 'react-dom';
import { createClient, ApolloOfflineClient } from "offix-client-boost";
import { ApolloOfflineProvider } from "react-offix-hooks";
import { ApolloProvider } from "@apollo/react-hooks";

import App from './App';
import * as serviceWorker from './serviceWorker';
import { Loading } from "./components";
import { clientConfig } from "./config/clientConfig";

let client: ApolloOfflineClient;

const Main = () => {
  const [initialized, setInitialized] = React.useState(false);

  React.useEffect(() => {
    createClient(clientConfig).then((newClient) => {
      client = newClient;
      setInitialized(true);
    }).catch((e)=>{
      console.log(e);
    });
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

ReactDOM.render(<Main />, document.getElementById("root"));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.register();
