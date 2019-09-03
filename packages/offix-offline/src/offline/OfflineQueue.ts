import { OperationQueueEntry } from "./OperationQueueEntry";
import { OfflineQueueListener } from "./events/OfflineQueueListener";
import { Operation, NextLink, Observable, FetchResult } from "apollo-link";
import { OfflineStore } from "./storage/OfflineStore";
import { IResultProcessor } from "./processors";
import { OfflineLinkConfig } from "./OfflineLinkConfig";
import { createOperation } from "apollo-link";
import { createMutationOptions } from "offix-cache";
export type OperationQueueChangeHandler = (entry: OperationQueueEntry) => void;

/**
 * Class implementing persistent operation queue.
 *
 * This class is designed to be used by OfflineLink
 * It provides these functionalities:
 *
 * - persisting operation queue in provided storage
 * - updating client IDs with server IDs (explained below)
 */
export class OfflineQueue {
  public queue: OperationQueueEntry[] = [];
  private readonly listener?: OfflineQueueListener;
  private store: OfflineStore;
  private resultProcessors: IResultProcessor[] | undefined;

  constructor(store: OfflineStore, options: OfflineLinkConfig) {
    this.store = store;
    this.listener = options.listener;
    this.resultProcessors = options.resultProcessors;
  }

  /**
   * Persist entire queue with the new item to make sure that change
   * is going to be working across restarts
   */
  public async persistItemWithQueue(operation: Operation) {
    const operationEntry = new OperationQueueEntry(operation);
    await this.store.saveEntry(operationEntry);
    return operationEntry;
  }

  /**
   * Enqueue offline change and wait for it to be sent to server when online.
   * Every offline change is added to queue.
   */
  public enqueueOfflineChange(operation: Operation, forward: NextLink): Observable<FetchResult> {
    const offlineId = operation.getContext().offlineId;
    const operationEntry = new OperationQueueEntry(operation, offlineId, forward);
    this.queue.push(operationEntry);
    if (this.listener && this.listener.onOperationEnqueued) {
      this.listener.onOperationEnqueued(operationEntry);
    }
    return new Observable<FetchResult>((observer) => {
      operationEntry.observer = observer;
      return () => {
        return;
      };
    });
  }

  public async forwardOperations() {
    for (const op of this.queue) {
      await new Promise((resolve, reject) => {
        if (!op.forward) {
          return;
        }
        // TODO remove createOperation. Probably a bigger discussion around how we fire mutations from here.
        const mutationOptions = createMutationOptions({mutation: op.query, variables: op.variables});
        const operation = createOperation(mutationOptions.context, {
          query: mutationOptions.mutation,
          variables: mutationOptions.variables
        });
        op.forward(operation).subscribe({
          next: (result: FetchResult) => {
            this.onForwardNext(operation, op, result);
          },
          error: (error: any) => {
            this.onForwardError(operation, op, error);
            return resolve();
          },
          complete: () => {
            if (op.observer) {
              op.observer.complete();
            }
            return resolve();
          }
        });
      });
    }
  }

  public executeResultProcessors(op: OperationQueueEntry,
    result: FetchResult<any>) {
    if (this.resultProcessors) {
      for (const resultProcessor of this.resultProcessors) {
        resultProcessor.execute(this.queue, op, result);
      }
    }
  }

  private onForwardError(operation: Operation, op: OperationQueueEntry, error: any) {
    if (this.listener && this.listener.onOperationFailure) {
      this.listener.onOperationFailure(operation, undefined, op.networkError);
    }
    if (op.observer) {
      op.observer.error(error);
    }
  }

  private onForwardNext(operation: Operation, op: OperationQueueEntry, result: FetchResult<any>) {
    const entry = this.queue.find(e => e === op);
    this.queue = this.queue.filter(e => e !== op);
    if (result.errors) {
      if (this.listener && this.listener.onOperationFailure) {
        this.listener.onOperationFailure(operation, result.errors);
      }
      // Notify for success otherwise
    } else if (result.data) {
      if (this.listener && this.listener.onOperationSuccess) {
        this.listener.onOperationSuccess(operation, result.data);
      }
      this.executeResultProcessors(op, result);
    }
    if (entry) {
      this.store.removeEntry(entry);
    }
    if (this.queue.length === 0 && this.listener && this.listener.queueCleared) {
      this.listener.queueCleared();
    }
    if (op.observer) {
      op.observer.next(result);
    }
  }

}
