import { OfflineQueueListener } from "./events/OfflineQueueListener";
import { FetchResult } from "apollo-link";
import { OfflineStore } from "./storage/OfflineStore";
import { IResultProcessor } from "./processors";
import { OfflineQueueConfig } from "./OfflineQueueConfig";
import { generateClientId } from "offix-cache";
import { ExecuteFunction } from "./ExecuteFunction";

export interface QueueEntry<T> {
  operation: QueueEntryOperation<T>;
  handlers?: QueueEntryHandlers;
}

export interface QueueEntryOperation<T> {
  qid: string;
  op: T;
}

export type resolveFunction = (value: any) => void;
export type rejectFunction = (reason: any) => void;

export interface QueueEntryHandlers {
  resolve: resolveFunction;
  reject: rejectFunction;
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

  private store?: OfflineStore<T>;

  private execute: ExecuteFunction<T>;

  private resultProcessors: Array<IResultProcessor<T>> | undefined;

  constructor(store: OfflineStore<T> | undefined, options: OfflineQueueConfig<T>) {
    this.store = store;
    this.resultProcessors = options.resultProcessors;
    this.execute = options.execute;

    if (options.listeners) {
      this.listeners = options.listeners;
    }
  }

  /**
   * Enqueue offline change and wait for it to be sent to server when online.
   * Every offline change is added to queue.
   */
  public async enqueueOperation(op: T, resolve: resolveFunction, reject: rejectFunction): Promise<any> {

    const entry: QueueEntry<T> = {
      operation: {
        qid: generateClientId(),
        op
      },
      handlers: {
        resolve,
        reject
      }
    };

    // enqueue and persist
    this.queue.push(entry);
    // notify listeners
    this.onOperationEnqueued(entry.operation);

    if (this.store) {
      try {
        await this.store.saveEntry(entry.operation);
      } catch (err) {
        console.error(err);
      }
    }
  }

  public async dequeueOperation(entry: QueueEntry<T>) {
    this.queue = this.queue.filter(e => e !== entry);
    if (this.store) {
      try {
        await this.store.removeEntry(entry.operation);
      } catch (err) {
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
      const result = await this.execute(entry.operation);
      this.onForwardNext(entry, result);
      if (entry.handlers) {
        entry.handlers.resolve(result);
      }
      // this.onForwardNext(operation, op, result)
    } catch (error) {
      if (entry.handlers) {
        entry.handlers.reject(error);
      }
      this.onOperationFailure(entry.operation, error);
    }
  }

  public executeResultProcessors(entry: QueueEntry<T>, result: FetchResult<any>) {
    if (this.resultProcessors) {
      for (const resultProcessor of this.resultProcessors) {
        resultProcessor.execute(this.queue, entry, result);
      }
    }
  }

  public async restoreOfflineOperations() {
    if (this.store) {
      try {
        const offlineEntries = await this.store.getOfflineData();
        for (const entry of offlineEntries) {
          this.onOperationRequeued(entry.operation);
        }
        this.queue = offlineEntries;
      } catch (error) {
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
      this.executeResultProcessors(entry, result);
      this.onOperationSuccess(entry.operation, result);
    }
    this.dequeueOperation(entry);
    if (this.queue.length === 0) {
      this.queueCleared();
    }
  }
}
