import { DocumentNode } from "graphql";

/**
 * GraphQL mutations for create, update and delete
 * TODO all the fields should be a ReplicatorSync Query
 */
export interface ReplicatorQueries {
  /**
   * GraphQL sync operation
   */
  sync: DocumentNode;
}
