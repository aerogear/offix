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
  public observer?: Observer<FetchResult>;
  public readonly optimisticResponse?: any;
  public subscription?: { unsubscribe: () => void };
  public result?: FetchResult;
  public networkError: any;
  protected resolveForward?: (value?: {} | PromiseLike<{}> | undefined) => void;
  protected rejectForward?: (reason?: any) => void;

  constructor(options: OperationQueueEntryOptions) {
    const { operation, forward } = options;

    this.operation = operation;
    this.forward = forward;
    if (typeof operation.getContext === "function") {
      this.optimisticResponse = operation.getContext().optimisticResponse;
    }

    this.handleNext = this.handleNext.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleComplete = this.handleComplete.bind(this);
  }

  public forwardOperation() {
    const { operation, forward } = this;
    const self = this;

    return new Promise((resolve, reject) => {
      this.resolveForward = resolve;
      this.rejectForward = reject;

      this.subscription = forward(operation).subscribe({
        next: self.handleNext,
        error: self.handleError,
        complete: self.handleComplete
      });
    });
  }

  public hasClientId() {
    return isClientGeneratedId(this.operation.variables.id);
  }

  protected handleNext(result: FetchResult) {
    this.result = result;
    if (this.observer && this.observer.next) {
      this.observer.next(result);
    }
  }

  protected handleError(error: any) {
    this.networkError = error;
    if (this.observer && this.observer.error) {
      this.observer.error(error);
    }
    if (this.rejectForward) {
      this.rejectForward(error);
    }
  }

  protected handleComplete() {
    if (this.observer && this.observer.complete) {
      this.observer.complete();
    }
    if (this.resolveForward) {
      this.resolveForward(this.result);
    }
  }
}
