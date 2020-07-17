import { createClient, defaultExchanges, subscriptionExchange, Client as URQLClient } from "urql";
import { SubscriptionClient, ClientOptions } from "subscriptions-transport-ws";
import { NetworkStatus } from "../../utils/NetworkStatus";

export interface GraphQLClientConfig {
  /**
   * GraphQl client endpoint url
   */
  url: string;

  /**
   * GraphQL client websocket url
   */
  wsUrl?: string;

  /**
   * Subscription client options
   */
  wsConfig?: ClientOptions;

  /**
   * Network status override. Required when subscription
   * config is not provided
   */
  networkStatus?: NetworkStatus;
}

const defaultWsConfig: ClientOptions = {
  reconnect: true,
  lazy: false,
  reconnectionAttempts: 10000000,
  inactivityTimeout: 100,
  // TODO hook into reconnect to reinitialize work
  connectionCallback: undefined
};

export function createGraphQLClient(clientConfig: GraphQLClientConfig): {
    gqlClient: URQLClient;
    networkStatus: NetworkStatus;
} {
  const { wsUrl, wsConfig, networkStatus, ...config } = clientConfig;
  if (!wsUrl) {
    if (!networkStatus) {
      throw new Error("No network status config provided");
    }
    return {
      gqlClient: createClient(config),
      networkStatus
    };
  }

  const subscriptionClient = new SubscriptionClient(wsUrl, {
    ...defaultWsConfig,
    ...wsConfig
  });

  const exchanges = [
    ...defaultExchanges,
    subscriptionExchange({
      forwardSubscription: operation => {
        return subscriptionClient.request(operation);
      }
    })
  ];
  return {
    gqlClient: createClient({ ...config, url: config.url, exchanges }),
    networkStatus: networkStatus ?? new NetworkStatus(subscriptionClient)
  };
}

