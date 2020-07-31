import { DocumentNode } from "graphql";

/**
 * GraphQL mutations for create, update and delete
 * TODO all the fields should be a ReplicatorSync Query
 */
export interface ReplicatorQueries {
  /**
   * FindQuery used to fetch data
   */
  find: DocumentNode;

  /**
   * GraphQL get operation
   */
  get: DocumentNode;

  /**
   * GraphQL sync operation
   */
  sync: DocumentNode;
}
