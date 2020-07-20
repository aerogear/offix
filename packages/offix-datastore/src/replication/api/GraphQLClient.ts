import { DocumentNode } from "graphql";
import Observable from "zen-observable";
import { SubscriptionClient, ClientOptions } from "subscriptions-transport-ws";

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


/**
 * A GraphQLClient to communicate with the GraphQLAPI
 * e.g. Urql, Apollo etc.
 */
export interface GraphQLClient {
  /**
   * sends a mutation to the server
   * @param query
   * @param variables
   */
  mutate<T>(query: string | DocumentNode, variables?: any): Promise<GraphQLClientReponse<T>>;

  /**
   * queries a graphql server
   * @param query
   * @param variables
   */
  query<T>(query: string | DocumentNode, variables?: any): Promise<GraphQLClientReponse<T>>;

  /**
   * Subscriptions to a graphql server
   * @param query
   */
  subscribe<T>(query: string | DocumentNode, variables?: any): Observable<T>;
}
