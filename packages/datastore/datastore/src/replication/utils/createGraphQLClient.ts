import { createClient, defaultExchanges, subscriptionExchange } from "urql";
import { SubscriptionClient, ClientOptions } from "subscriptions-transport-ws";
import { GraphQLClientConfig } from "../api/GraphQLClient";

const defaultWsConfig: ClientOptions = {
  reconnect: true,
  lazy: false,
  reconnectionAttempts: 10000000,
  inactivityTimeout: 100
};

/**
 * Creates URQL GraphQL Client with optional websockets support.
 *
 * @param clientConfig
 */
export function createGraphQLClient(clientConfig: GraphQLClientConfig) {
  const { wsUrl, wsConfig, ...config } = clientConfig;
  if (!wsUrl) {
    return { client: createClient(config) };
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
  const client = createClient({ ...config, url: config.url, exchanges });

  return { client, subscriptionClient };
}

