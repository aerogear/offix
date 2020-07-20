import { DocumentNode } from "graphql";

/**
 * GraphQL mutations for create, update and delete
 * TODO all the fields should be a ReplicatorSync Query
 */
export interface ReplicatorQueries {
  /**
   * FindQuery used to fetch data
   */
  find: string | DocumentNode;

  /**
   * GraphQL get operation
   */
  get: string | DocumentNode;

  /**
   * GraphQL sync operation
   */
  sync: string | DocumentNode;
}
