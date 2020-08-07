import { DocumentNode } from "graphql";

/**
 * GraphQL mutations for create, update and delete
 */
export interface ReplicatorMutations {
  /**
   * GraphQL create mutation document.
   * It takes an input variable which is the entity to be created
   */
  create: string | DocumentNode;

  /**
   * GraphQL update mutation document.
   * It takes an input variable which contains the
   * update to be made and the id of the entity to be updated
   */
  update: string | DocumentNode;

  /**
   * GraphQL delete mutation document.
   * It takes an input variable which contains
   * fields that match the entity to be deleted
   */
  delete: string | DocumentNode;
}
