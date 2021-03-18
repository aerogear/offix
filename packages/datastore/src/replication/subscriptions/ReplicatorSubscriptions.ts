import { DocumentNode } from "graphql";

/**
 * GraphQL mutations for create, update and delete
 */
export interface ReplicatorSubscriptions {
  /**
   * GraphQL create subscription document.
   */
  new: any | DocumentNode;

  /**
   * GraphQL update subscription document.
   */
  updated: any | DocumentNode;

  /**
   * GraphQL delete subscription document.
   */
  deleted: any | DocumentNode;
}
