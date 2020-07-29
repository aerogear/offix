
import { ClientOptions } from "subscriptions-transport-ws";

/**
 * Represents error information returned from GraphQL Client
 */
export interface GraphQLClientReponse<T = any> {
  data?: T[];
  errors?: any[];
}

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
