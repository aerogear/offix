import { FetchResult, NextLink, Operation } from "apollo-link";
import { isClientGeneratedId } from "../cache/createOptimisticResponse";

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
  public observer?: ZenObservable.SubscriptionObserver<FetchResult>;

  constructor(operation: Operation, forward: NextLink) {
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
