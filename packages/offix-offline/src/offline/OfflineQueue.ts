import { OperationQueueEntry } from "./OperationQueueEntry";
import { OfflineQueueListener } from "./events/OfflineQueueListener";
import { FetchResult } from "apollo-link";
import { OfflineStore } from "./storage/OfflineStore";
import { IResultProcessor } from "./processors";
import { OfflineQueueConfig } from "./OfflineLinkConfig";
import { MutationOptions } from "offix-cache/node_modules/apollo-client";
import { generateClientId } from "offix-cache";

export type OperationQueueChangeHandler = (entry: OperationQueueEntry) => void;

export interface QueueEntry {
  operation: QueueEntryOperation
  handlers?: QueueEntryHandlers
}

export interface QueueEntryOperation {
  qid: string
  op: any
}

export interface QueueEntryHandlers {
  resolve: Function
  reject: Function
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
export class OfflineQueue {
  public queue: QueueEntry[] = [];

  // listeners that can be added by the user to handle various events coming from the offline queue
  public listeners: OfflineQueueListener[] = [];

  private store: OfflineStore;

  private execute: Function

  private resultProcessors: IResultProcessor[] | undefined;

  constructor(store: OfflineStore, options: OfflineQueueConfig) {
    this.store = store;
    this.resultProcessors = options.resultProcessors;
    this.execute = options.execute

    if (options.listeners) {
      this.listeners = options.listeners;
    }
  }

  /**
   * Enqueue offline change and wait for it to be sent to server when online.
   * Every offline change is added to queue.
   */
  public async enqueueOfflineChange(op: MutationOptions, resolve: Function, reject: Function): Promise<any> {

    const entry: QueueEntry = {
      operation: {
        qid: generateClientId(),
        op,
      },
      handlers: {
        resolve,
        reject
      }
    }
    
    // enqueue and persist
    this.queue.push(entry);

    try {
      await this.store.saveEntry(entry.operation);
    } catch(err) {
      console.log(err)
    }

    // notify listeners
    this.onOperationEnqueued(entry.operation);
  }

  public async forwardOperations() {
    for (const entry of this.queue) {
      console.log('forwarding operation', entry)
      await this.forwardOperation(entry)
    }
    console.log('operations forwarded', this.queue)
  }

  async forwardOperation(entry: QueueEntry) {
    try {
      const result = await this.execute(entry.operation)
      this.onForwardNext(entry, result);
      if (entry.handlers) {
        entry.handlers.resolve(result)
      }
      // this.onForwardNext(operation, op, result)
    } catch (error) {
      console.log('error forwarding operation', error)
      if (entry.handlers) {
        entry.handlers.reject(error)
      }
      this.onOperationFailure(entry.operation, error)
    }
  }

  public executeResultProcessors(entry: QueueEntry, result: FetchResult<any>) {
    if (this.resultProcessors) {
      for (const resultProcessor of this.resultProcessors) {
        resultProcessor.execute(this.queue, entry, result);
      }
    }
  }

  private onForwardNext(entry: QueueEntry, result: any) {
    this.queue = this.queue.filter(e => e !== entry)
    console.log('forward result', JSON.stringify(result, null, 2))
    
    if (result.errors) {
      // TODO distiguish between application errors that happen here
      // And other errors that may happen in forwardOperation
      this.onOperationFailure(entry.operation, result.errors)
      // Notify for success otherwise
    } else if (result.data) {
      this.onOperationSuccess(entry.operation, result)
      // this.executeResultProcessors(op, result);
    }
    this.store.removeEntry(entry.operation)
    if (this.queue.length === 0) {
      this.queueCleared();
    }
  }

  registerOfflineQueueListener(listener: OfflineQueueListener) {
    this.listeners.push(listener)
  }

  onOperationEnqueued(op: QueueEntryOperation) {
    for (const listener of this.listeners) {
      if (listener.onOperationEnqueued) {
        listener.onOperationEnqueued(op)
      } 
    }
  }

  onOperationSuccess(op: QueueEntryOperation, result: any) {
    for (const listener of this.listeners) {
      if (listener.onOperationSuccess) {
        listener.onOperationSuccess(op, result)
      } 
    }
  }

  onOperationFailure(op: QueueEntryOperation, error: Error) {
    for (const listener of this.listeners) {
      if (listener.onOperationFailure) {
        listener.onOperationFailure(op, error)
      } 
    }
  }

  queueCleared() {
    for (const listener of this.listeners) {
      if (listener.queueCleared) {
        listener.queueCleared()
      } 
    }
  }
}
