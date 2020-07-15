import { createClient, defaultExchanges, subscriptionExchange, Client } from "urql";
import { SubscriptionClient, ClientOptions } from "subscriptions-transport-ws";

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
}

const defaultWsConfig: ClientOptions = {
  reconnect: true,
  lazy: false,
  reconnectionAttempts: 10000000,
  inactivityTimeout: 100,
  // TODO hook into reconnect to reinitialize work
  connectionCallback: undefined
};

export class GraphQLClient {

  public static create(clientConfig: GraphQLClientConfig): Client {
    const { wsUrl, wsConfig, ...config } = clientConfig;
    if (!wsUrl) {
      return createClient(config);
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

    return createClient({ ...config, url: config.url, exchanges });
  }

}
