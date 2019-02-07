import { Operation, NextLink, Observable } from "apollo-link";
import { OperationQueueEntry, OperationQueueEntryOptions } from "./OperationQueueEntry";

export type OperationQueueChangeHandler = (entry: OperationQueueEntry) => void;

export interface OperationQueueOptions {
  onEnqueue: OperationQueueChangeHandler;
  onDequeue: OperationQueueChangeHandler;
}

export class OperationQueue {
  protected queue: OperationQueueEntry[] = [];
  protected onEnqueue: OperationQueueChangeHandler;
  protected onDequeue: OperationQueueChangeHandler;

  constructor(options: OperationQueueOptions) {
    const { onEnqueue, onDequeue } = options;

    this.onEnqueue = onEnqueue;
    this.onDequeue = onDequeue;
  }

  public enqueue(
    operation: Operation,
    forward: NextLink,
    entry?: new (options: OperationQueueEntryOptions) => OperationQueueEntry
  ) {
    const operationEntry = new (entry || OperationQueueEntry)({ operation, forward });

    this.enqueueEntry(operationEntry);

    return this.getObservable(operationEntry);
  }

  public toBeForwarded() {
    return this.queue.filter(op => !op.subscription && !op.hasClientId());
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
