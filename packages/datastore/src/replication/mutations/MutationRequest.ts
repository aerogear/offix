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
   * Data used to send by mutation
   */
  data: any;

  /**
   * Name of the store
   */
  storeName: string;
}

