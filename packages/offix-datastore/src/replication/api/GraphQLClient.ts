import { DocumentNode } from "graphql";
import Observable from "zen-observable";

export interface GraphQLClientReponse<T>{
  data?: T[];
  errors?: any[];
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
