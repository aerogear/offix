import { Model } from "../../Model";
import { MutationRequest } from "./MutationRequest";

/**
 * Queue that manages replication of the mutations for all local edits.
 */
export class MutationsReplicationQueue {
  private items: MutationRequest[];
  private started: boolean;

  constructor() {
    this.started = false;
    this.items = [];
  }

  public init() {
    this.started = true;
    this.start();
  }

  public addMutation(mutation: MutationRequest) {
    this.items.push(mutation);
  }

  public start() {
    if (this.started) {
      return;
    }
  }

  public stop() {
    this.started = false;
  }

}
