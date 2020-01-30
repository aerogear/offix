import { OfflineQueueListener } from "./OfflineQueueListener";
import { OfflineStore } from "../store/OfflineStore";
import { OfflineQueueConfig } from "./OfflineQueueConfig";
import { QueueExecuteFunction } from "./QueueExecuteFunction";

/**
 * An entry in the OfflineQueue
 */
export interface QueueEntry<T> {
  // contains the acutal entry data
  operation: QueueEntryOperation<T>;
  // handler functions for when the entry is fulfilled/not fulfilled
  // handlers can not be written to storage
  // so they will not be present on operations that were restored
  // after app restart
  handlers?: QueueEntryHandlers;
}

/**
 * QueueEntryOperaton contains the actual data
 * for a particular offline operation
 * this could be all the options used
 * to build a HTTP request or a GraphQL request
 */
export interface QueueEntryOperation<T> {
  // Unique ID assigned to the operation by the queue
  qid: string;
  // The generic data/options for that particular operation
  op: T;
}

/**
 * // handler functions for when a QueueEntry is fulfilled/not fulfilled
 */
export interface QueueEntryHandlers {
  // handler function for when a QueueEntry is fulfilled
  resolve: (value: any) => void;
  // handler function for when a QueueEntry is not fulfilled
  reject: (reason: any) => void;
}

/**
 * Class implementing persistent operation queue.
 *
 * This class is designed to be used by OfflineLink
 * It provides these functionalities:
 *
 * - persisting operation queue in provided storage
 * - updating client IDs with server IDs (explained below)
 */
export class OfflineQueue<T> {
  public queue: Array<QueueEntry<T>> = [];

  // listeners that can be added by the user to handle various events coming from the offline queue
  public listeners: Array<OfflineQueueListener<T>> = [];

  private store: OfflineStore<T>;

  private execute: QueueExecuteFunction<T>;

  constructor(store: OfflineStore<T>, options: OfflineQueueConfig<T>) {
    this.store = store;
    this.execute = options.execute;

    if (options.listeners) {
      this.listeners = options.listeners;
    }
  }

  /**
   * Enqueue offline change and wait for it to be sent to server when online.
   * Every offline change is added to queue.
   */
  public async enqueueOperation(op: T): Promise<any> {

    const entry: QueueEntry<T> = {
      operation: {
        qid: ID(),
        op
      }
    };

    // enqueue and persist
    this.queue.push(entry);
    // notify listeners
    this.onOperationEnqueued(entry.operation);

    if (this.store.initialized) {
      try {
        await this.store.saveEntry(entry.operation);
      } catch (err) {
        console.error(err);
      }
    }

    return entry;
  }

  public buildPromiseForEntry(entry: QueueEntry<T>) {
    return new Promise((resolve, reject) => {
      entry.handlers = {
        resolve,
        reject
      };
    });
  }

  public async dequeueOperation(entry: QueueEntry<T>) {
    this.queue = this.queue.filter(e => e !== entry);
    if (this.store.initialized) {
      try {
        await this.store.removeEntry(entry.operation);
      } catch (err) {
        // TODO integration test for this
        // TODO should we log something here?
        console.error(err);
      }
    }
  }

  public async forwardOperations() {
    for (const entry of this.queue) {
      await this.forwardOperation(entry);
    }
  }

  public async forwardOperation(entry: QueueEntry<T>) {
    try {
      const result = await this.execute(entry.operation.op);
      this.onForwardNext(entry, result);
      if (entry.handlers) {
        entry.handlers.resolve(result);
      }
    } catch (error) {
      if (entry.handlers) {
        entry.handlers.reject(error);
      }
      this.onOperationFailure(entry.operation, error);
    }
  }

  public async restoreOfflineOperations() {
    if (this.store.initialized) {
      try {
        const offlineEntries = await this.store.getOfflineData();
        for (const entry of offlineEntries) {
          this.onOperationRequeued(entry.operation);
        }
        this.queue = offlineEntries;
      } catch (error) {
        // TODO should we be logging something here?
        // TODO integration tests covering this
        // Possible reasons for failure are
        // no storage available
        // or the deserializeFromStorage function failed
        console.error(error);
      }
    }
  }

  public registerOfflineQueueListener(listener: OfflineQueueListener<T>) {
    this.listeners.push(listener);
  }

  public onOperationEnqueued(op: QueueEntryOperation<T>) {
    for (const listener of this.listeners) {
      if (listener.onOperationEnqueued) {
        listener.onOperationEnqueued(op);
      }
    }
  }

  public onOperationRequeued(op: QueueEntryOperation<T>) {
    for (const listener of this.listeners) {
      if (listener.onOperationRequeued) {
        listener.onOperationRequeued(op);
      }
    }
  }

  public onOperationSuccess(op: QueueEntryOperation<T>, result: any) {
    for (const listener of this.listeners) {
      if (listener.onOperationSuccess) {
        listener.onOperationSuccess(op, result);
      }
    }
  }

  public onOperationFailure(op: QueueEntryOperation<T>, error: Error) {
    for (const listener of this.listeners) {
      if (listener.onOperationFailure) {
        listener.onOperationFailure(op, error);
      }
    }
  }

  public queueCleared() {
    for (const listener of this.listeners) {
      if (listener.queueCleared) {
        listener.queueCleared();
      }
    }
  }

  private onForwardNext(entry: QueueEntry<T>, result: any) {
    if (result.errors) {
      // TODO distiguish between application errors that happen here
      // And other errors that may happen in forwardOperation
      this.onOperationFailure(entry.operation, result.errors);
      // Notify for success otherwise
    } else if (result.data) {
      this.onOperationSuccess(entry.operation, result);
    }
    this.dequeueOperation(entry);
    if (this.queue.length === 0) {
      this.queueCleared();
    }
  }
}

/**
 *
 * Helper function to generate a simple alphanumeric ID for queue entries
 */
function ID() {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return "queue:" + Math.random().toString(36).substr(2, 9);
};
