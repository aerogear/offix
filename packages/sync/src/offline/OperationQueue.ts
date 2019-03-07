import { NextLink, Observable, Operation } from "apollo-link";
import { OperationQueueEntry, OperationQueueEntryOptions } from "./OperationQueueEntry";

export type OperationQueueChangeHandler = (entry: OperationQueueEntry) => void;

export interface OperationQueueOptions {
  onEnqueue: OperationQueueChangeHandler;
  onDequeue: OperationQueueChangeHandler;
}

/**
 * Class implementing GraphQL operation queue.
 *
 * Queue can be used to keep track of pending operations
 * or to defer their forward to next Apollo link.
 *
 * Once operation in queue succeeds/fails it is automatically
 * removed from queue.
 */
export class OperationQueue {
  protected queue: OperationQueueEntry[] = [];
  protected onEnqueue: OperationQueueChangeHandler;
  protected onDequeue: OperationQueueChangeHandler;

  constructor(options: OperationQueueOptions) {
    const { onEnqueue, onDequeue } = options;

    this.onEnqueue = onEnqueue;
    this.onDequeue = onDequeue;
  }

  /**
   * Enqueues new operation in queue and returns Observable for it.
   */
  public enqueue(
    operation: Operation,
    forward: NextLink,
    entry?: new (options: OperationQueueEntryOptions) => OperationQueueEntry
  ) {
    const operationEntry = new (entry || OperationQueueEntry)({ operation, forward });

    this.enqueueEntry(operationEntry);

    return this.getObservable(operationEntry);
  }

  /**
   * Returns operations from queue that have not yet been forwarded.
   */
  public toBeForwarded() {
    return this.queue.filter(op => !op.subscription);
  }

  public all() {
    return this.queue.slice();
  }

  protected enqueueEntry(entry: OperationQueueEntry) {
    this.queue.push(entry);
    this.onEnqueue(entry);
  }

  protected getObservable(entry: OperationQueueEntry) {
    return new Observable(observer => {
      entry.observer = observer;
      return () => this.dequeue(entry);
    });
  }

  protected dequeue(entry: OperationQueueEntry, notify: boolean = true) {
    const subscription = entry.subscription;

    if (subscription) {
      subscription.unsubscribe();
    }

    this.queue = this.queue.filter(e => e !== entry);

    if (notify) {
      this.onDequeue(entry);
    }
  }
}
