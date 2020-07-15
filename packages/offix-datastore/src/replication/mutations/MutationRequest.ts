import { DocumentNode } from "graphql";
import { StoreChangeEvent } from "../../storage";


/**
 * Request to perform mutation.
 * This object contain all information needed to perform specific mutations
 */
export class MutationRequest {
  public event: StoreChangeEvent;

  constructor(event: StoreChangeEvent) {
    this.event = event;
  }
}
