import { WebSocketLink } from "apollo-link-ws";
import { OffixBoostOptions } from "../config/OffixBoostOptions";

export const defaultWebSocketLink = (options: OffixBoostOptions) => {
  const websocketClientOptions = options.websocketClientOptions || {}
  return new WebSocketLink({
    uri: options.wsUrl,
    options: {
      // Params that can be used to send authentication token etc.
      connectionParams: websocketClientOptions.connectionParams || async function connectionParams() {
        if (options.authContextProvider) {
          const { headers } = await options.authContextProvider()
          return headers
        }
      },
      connectionCallback: websocketClientOptions.connectionCallback,
      timeout: websocketClientOptions.timeout || 10000,
      // How long client should wait to kill connection
      inactivityTimeout: 10000,
      // Large value to support offline state connections
      reconnectionAttempts: websocketClientOptions.reconnectionAttempts || 500,
      // Fixed value to support going offline
      reconnect: true,
      // Fixed value to support clients with no subscriptions
      lazy: true
    }
  });
};
