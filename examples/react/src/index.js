import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";
import { createClient } from "offix-client-boost";
import { ApolloOfflineProvider } from "react-offix-hooks";
import { ApolloProvider } from "@apollo/react-hooks";
import App from "./App";
import { Loading } from "./components";
import { clientConfig } from "./clientConfig";

let client = undefined;

const Main = () => {
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
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

ReactDOM.render(<Main />, document.getElementById("app"));
