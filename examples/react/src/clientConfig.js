import { InMemoryCache } from "apollo-cache-inmemory";
import { WebNetworkStatus } from "offix-client-boost";

export const clientConfig = {
  httpUrl: "http://localhost:4000/graphql",
  wsUrl: "ws://localhost:4000/graphql",
  fileUpload: true,
  networkStatus: new WebNetworkStatus(),
  cache: new InMemoryCache(),
  websocketClientOptions: {
    reconnect: true,
    lazy: true,
  },
};
