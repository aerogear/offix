
import { DocumentNode } from "graphql";
import { CRUDEvents } from "../..";

/**
 * Request to perform mutation.
 * This object contain all information needed to perform specific mutations
 */
export interface MutationRequest {
  /**
   * Type of event/operation
   */
  eventType: CRUDEvents;
  /**
   * Version used to detect changes in structure
   */
  version: number;
  /**
   * Document mutation to be executed on server
   */
  mutation: DocumentNode;
  /**
   * Query variables used in client
   */
  variables: any;

  /**
   * Primary key
   */
  storeName: string;
}
