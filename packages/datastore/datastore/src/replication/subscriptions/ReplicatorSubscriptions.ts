import { DocumentNode } from "graphql";

/**
 * GraphQL mutations for create, update and delete
 */
export interface ReplicatorSubscriptions {
  /**
   * GraphQL create subscription document.
   */
  new: string | DocumentNode;

  /**
   * GraphQL update subscription document.
   */
  updated: string | DocumentNode;

  /**
   * GraphQL delete subscription document.
   */
  deleted: string | DocumentNode;
}
