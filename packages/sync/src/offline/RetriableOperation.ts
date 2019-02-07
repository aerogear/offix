import { isNetworkError } from "../utils/helpers";
import { OperationQueueEntry } from "./OperationQueueEntry";
import { Operation } from "apollo-link";

const INITIAL_TIMEOUT = 1000;

export type shouldRetryFn = (count: number, operation: Operation, error: any) => boolean;

export class RetriableOperation extends OperationQueueEntry {
  public timeout: number = INITIAL_TIMEOUT;
  public cancelCurrentTimeout?: () => void;

  public forceRetry() {
    this.timeout = INITIAL_TIMEOUT;
    if (this.cancelCurrentTimeout) {
      this.cancelCurrentTimeout();
    }
  }

  public async try(shouldRetry: shouldRetryFn) {
    let networkError;
    let retry;
    let attempts = 0;

    do {
      try {
        return await this.forwardOperation();
      } catch (error) {
        networkError = isNetworkError(error);
        if (networkError) {
          await new Promise(resolve => {
            this.cancelCurrentTimeout = resolve;
            setTimeout(resolve, this.timeout);
          });

          this.timeout *= 2;
          attempts++;

          retry = shouldRetry(attempts, this.operation, error);
          if (!retry && this.observer && this.observer.error) {
            this.observer.error(error);
          }
        }
      }
    } while (networkError && retry);
  }

  protected handleError(error: any) {
    if (this.rejectForward) {
      this.rejectForward(error);
    }
  }
}
