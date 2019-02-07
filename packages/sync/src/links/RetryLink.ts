import { ApolloLink, Operation, NextLink, Observable, FetchResult } from "apollo-link";
import { OperationQueue } from "../offline/OperationQueue";
import { isMutation, isNetworkError } from "../utils/helpers";
import { RetriableOperation, shouldRetryFn } from "../offline/RetriableOperation";

export interface RetryLinkOptions {
  shouldRetry?: shouldRetryFn;
}

export class RetryLink extends ApolloLink {
  private queue: OperationQueue;
  private shouldRetry: shouldRetryFn;

  constructor(options: RetryLinkOptions) {
    super();

    const { shouldRetry } = options;

    this.shouldRetry = shouldRetry || (() => true);

    this.try = this.try.bind(this);
    this.forceRetry = this.forceRetry.bind(this);

    const queueOptions = {
      onEnqueue: this.try,
      onDequeue: this.forceRetry
    };

    this.queue = new OperationQueue(queueOptions);
  }

  public request(operation: Operation, forward: NextLink) {
    if (isMutation(operation)) {
      return this.queue.enqueue(operation, forward, RetriableOperation);
    } else {
      const observer = forward(operation);
      this.forceRetryOnCompletedQuery(observer);
      return observer;
    }
  }

  private forceRetryOnCompletedQuery(observer: Observable<FetchResult>) {
    const self = this;
    observer.subscribe({
      complete: self.forceRetry,
      error: error => {
        if (!isNetworkError(error)) {
          self.forceRetry();
        }
      }
    });
  }

  private try() {
    this.queue.toBeForwarded().forEach(operation =>
      (operation as RetriableOperation).try(this.shouldRetry)
    );
  }

  private forceRetry() {
    this.queue.all().forEach(operation =>
      (operation as RetriableOperation).forceRetry()
    );
  }
}
