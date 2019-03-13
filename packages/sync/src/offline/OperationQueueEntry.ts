import { FetchResult, NextLink, Operation } from "apollo-link";
import { Observer } from "zen-observable-ts";
import { isClientGeneratedId } from "../cache/createOptimisticResponse";

export interface OperationQueueEntryOptions {
  operation: Operation;
  forward: NextLink;
}

/**
 * Class representing operation queue entry.
 *
 * It exposes method for forwarding the operation.
 */
export class OperationQueueEntry {
  public readonly operation: Operation;
  public readonly forward: NextLink;
  public readonly optimisticResponse?: any;
  public result?: FetchResult;
  public networkError: any;

  constructor(options: OperationQueueEntryOptions) {
    const { operation, forward } = options;

    this.operation = operation;
    this.forward = forward;
    if (typeof operation.getContext === "function") {
      this.optimisticResponse = operation.getContext().optimisticResponse;
    }
  }

  public hasClientId() {
    return isClientGeneratedId(this.operation.variables.id);
  }

}
