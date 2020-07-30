
import { ClientOptions } from "subscriptions-transport-ws";
import { ClientOptions as URQLOriginalOptions } from "urql"
/**
 * Represents error information returned from GraphQL Client
 */
export interface GraphQLClientReponse<T = any> {
  data?: T[];
  errors?: any[];
}

export interface URQLConfig extends Omit<URQLOriginalOptions, "url"> { }

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
   * URLQL specific options
   */
  clientConfig?: URQLConfig
}
