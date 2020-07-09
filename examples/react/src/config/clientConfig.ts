import { InMemoryCache } from "apollo-cache-inmemory";
import { OffixBoostOptions, WebNetworkStatus } from "offix-client-boost";

export const clientConfig: OffixBoostOptions = {
  httpUrl: "http://localhost:5000/graphql",
  wsUrl: "ws://localhost:5000/graphql",
  networkStatus: new WebNetworkStatus(),
  cache: new InMemoryCache(),
};
