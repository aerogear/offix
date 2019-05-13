import { WebSocketLink } from "apollo-link-ws";
import { DataSyncConfig } from "../config";

export const defaultWebSocketLink = (userOptions: DataSyncConfig, config: WebSocketLink.Configuration) => {
  const options = config.options || {};
  return new WebSocketLink({
    uri: config.uri,
    options: {
      // Params that can be used to send authentication token etc.
      connectionParams: async () => {
        if (userOptions.authContextProvider) {
          const { header } = await userOptions.authContextProvider();
          return { Authorization: header };
        }
      },
      connectionCallback: options.connectionCallback,
      timeout: options.timeout || 10000,
      // How long client should wait to kill connection
      inactivityTimeout: 10000,
      // Large value to support offline state connections
      reconnectionAttempts: options.reconnectionAttempts || 500,
      // Fixed value to support going offline
      reconnect: true,
      // Fixed value to support clients with no subscriptions
      lazy: true
    }
  });
};
