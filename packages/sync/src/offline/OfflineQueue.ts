import { OperationQueueEntry } from "./OperationQueueEntry";
import { PersistedData, PersistentStore } from "../PersistentStore";
import { OfflineQueueListener } from "./OfflineQueueListener";
import { isClientGeneratedId } from "../cache/createOptimisticResponse";
import { ObjectState } from "../conflicts/ObjectState";
import { Operation, NextLink, Observable, FetchResult } from "apollo-link";
import { OfflineLinkOptions } from "..";
import { isMarkedOffline, markOffline } from "../utils/helpers";

export interface OfflineQueueOptions {
  storage?: PersistentStore<PersistedData>;
  storageKey?: string;
  listener?: OfflineQueueListener;
  conflictStateProvider?: ObjectState;
  onEnqueue: OperationQueueChangeHandler;
  onDequeue: OperationQueueChangeHandler;
}

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
  private readonly storage?: PersistentStore<PersistedData>;
  private readonly storageKey?: string;
  private readonly listener?: OfflineQueueListener;
  private readonly state?: ObjectState;

  constructor(options: OfflineLinkOptions) {
    this.storage = options.storage;
    this.storageKey = options.storageKey;
    this.listener = options.listener;
    this.state = options.conflictStateProvider;
  }

  public enqueue(operation: Operation, forward: NextLink) {
    const operationEntry = new OperationQueueEntry(operation, forward);
    this.enqueueEntry(operationEntry);
    return new Observable((observer) => {
      operationEntry.observer = observer;
      // TODO add support for cancelling offline requests
      return () => {
        return;
      };
    });
  }

  public async forwardOperations() {
    for (const op of this.queue) {
      // FIXME block operations till result is back (completed)
      await new Promise((resolve, reject) => {
        op.forward(op.operation).subscribe({
          next: (result: FetchResult) => {
            this.onForwardNext(op, result);
          },
          error: (error: any) => {
            this.onForwardError(op, error);
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

  private enqueueEntry(entry: OperationQueueEntry) {
    this.queue.push(entry);
    if (this.listener && this.listener.onOperationEnqueued) {
      this.listener.onOperationEnqueued(entry);
    }
    // If operation was already enqueued before (sent from OfflineRestoreHandler)
    if (!isMarkedOffline(entry.operation)) {
      markOffline(entry.operation);
      this.persist();
    }
  }

  private onForwardError(op: OperationQueueEntry, error: any) {
    if (this.listener && this.listener.onOperationFailure) {
      this.listener.onOperationFailure(op.operation, undefined, op.networkError);
    }
    if (op.observer) {
      op.observer.error(error);
    }
  }

  private onForwardNext(op: OperationQueueEntry, result: FetchResult<any>) {
    this.queue = this.queue.filter(e => e !== op);
    if (result.errors) {
      if (this.listener && this.listener.onOperationFailure) {
        this.listener.onOperationFailure(op.operation, result.errors);
      }
      // Notify for success otherwise
    } else if (result.data) {
      if (this.listener && this.listener.onOperationSuccess) {
        this.listener.onOperationSuccess(op.operation, result.data);
      }
      this.updateIds(op, result);
      this.updateObjectState(op, result);
    }
    this.persist();
    if (this.queue.length === 0 && this.listener && this.listener.queueCleared) {
      this.listener.queueCleared();
    }
    if (op.observer) {
      op.observer.next(result);
    }
  }

  private persist() {
    if (this.storage && this.storageKey) {
      this.storage.setItem(this.storageKey, JSON.stringify(this.queue));
    }
  }

  /**
   * Allow updates on items created while offline.
   * If item is created while offline and client generated ID is provided
   * to optimisticResponse, later mutations on this item will be using this client
   * generated ID. Once any create operation is successful, we should
   * update entries in queue with ID returned from server.
   */
  private updateIds(entry: OperationQueueEntry, result: FetchResult) {
    const { operation: { operationName }, optimisticResponse } = entry;
    if (!result ||
      !optimisticResponse ||
      !optimisticResponse[operationName] ||
      !isClientGeneratedId(optimisticResponse[operationName].id)) {
      return;
    }

    const clientId = optimisticResponse && optimisticResponse[operationName].id;

    this.queue.forEach(({ operation: op }) => {
      if (op.variables.id === clientId) {
        op.variables.id = result.data && result.data[operationName].id;
      }
    });
  }

  /**
   * Manipulate state of item that is being used for conflict resolution purposes.
   * This is required for the queue items so that we do not get a conflict with ourself
   * @param entry the operation which returns the result we compare with first queue entry
   */
  private updateObjectState(entry: OperationQueueEntry, result: FetchResult) {
    const { operation: { operationName } } = entry;
    if (!result || !this.state) {
      return;
    }

    if (result.data && result.data[operationName]) {
      for (const { operation: op } of this.queue) {
        if (op.variables.id === entry.operation.variables.id && op.operationName === entry.operation.operationName) {
          const opVersion = this.state.currentState(op.variables);
          const prevOpVersion = this.state.currentState(entry.operation.variables);
          if (opVersion === prevOpVersion) {
            op.variables = this.state.nextState(op.variables);
            break;
          }
        }
      }
    }
  }
}
