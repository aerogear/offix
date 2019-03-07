import { ApolloLink, NextLink, Operation } from "apollo-link";
import { OperationQueue } from "../offline/OperationQueue";
import { isMutation } from "../utils/helpers";
import { RetriableOperation } from "../offline/retry/RetriableOperation";
import { ShouldRetryFn } from "../offline/retry/ShouldRetry";

export interface RetryLinkOptions {
  shouldRetry?: ShouldRetryFn;
}

/**
 * Apollo link implementation used to retry mutations on
 * network error (i.e. server unreachable).
 *
 * Link will push every incoming mutation to queue and try
 * to forward it. When mutation can not reach server, next
 * try is scheduled.
 *
 * If there is response from server for any operation (i.e.
 * query or mutation) all pending mutations are force retried.
 *
 * shouldRetry function can be passed to constructor. This function
 * will be called on every failed retry. If it returns false, operation
 * won't be retried again, but it will fail.
 */
export class RetryLink extends ApolloLink {
  private queue: OperationQueue;
  private shouldRetry: ShouldRetryFn;

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
      // Enable only for mutations
      return forward(operation);
    }
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
