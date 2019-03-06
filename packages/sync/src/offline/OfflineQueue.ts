import { OperationQueueEntry } from "./OperationQueueEntry";
import { PersistentStore, PersistedData } from "../PersistentStore";
import { OfflineQueueListener } from "./OfflineQueueListener";
import { OperationQueue, OperationQueueChangeHandler } from "./OperationQueue";
import { isClientGeneratedId } from "../cache/createOptimisticResponse";
import { ObjectState } from "../conflicts/ObjectState";

export interface OfflineQueueOptions {
  storage?: PersistentStore<PersistedData>;
  storageKey?: string;
  listener?: OfflineQueueListener;
  conflictStateProvider?: ObjectState;
  onEnqueue: OperationQueueChangeHandler;
  onDequeue: OperationQueueChangeHandler;
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
export class OfflineQueue extends OperationQueue {
  private readonly storage?: PersistentStore<PersistedData>;
  private readonly storageKey?: string;
  private readonly listener?: OfflineQueueListener;
  private readonly state?: ObjectState;

  constructor(options: OfflineQueueOptions) {
    super(options);

    const { storage, storageKey, listener, conflictStateProvider } = options;

    this.storage = storage;
    this.storageKey = storageKey;
    this.listener = listener;
    this.state = conflictStateProvider;
  }

  /**
   * Returns list of operations that can be forwarded - i.e. they have not
   * been forwarded yet and do not have client ID.
   */
  public toBeForwarded() {
    return this.queue.filter(op => !op.subscription && !op.hasClientId());
  }

  protected enqueueEntry(entry: OperationQueueEntry) {
    this.queue.push(entry);
    this.onEnqueue(entry);
    this.persist();

    if (this.listener && this.listener.onOperationEnqueued) {
      this.listener.onOperationEnqueued(entry);
    }
  }

  protected dequeue(entry: OperationQueueEntry) {
    // Network error: Skip dequeue and just notify users that network error happen.
    // Items will be sent on next offline/online change.
    // Reason for that is that device may be notifying us about the online state
    // but technically quality of link will not allow to perform actual requests.
    // We need to wait for the next offline state to succeed.
    if (entry.networkError) {
      if (this.listener && this.listener.onOperationFailure) {
        this.listener.onOperationFailure(entry.operation, undefined, entry.networkError);
      }
      return;
    }

    // For Success and GraphQL errors
    // If operation is successful we perform updates on offline data
    // that is sequential. In case of GraphQL errors (validation/auth etc.) we cannot
    // properly handle those and we return info to users in order to deal with them
    if (entry.result) {
      super.dequeue(entry, false);
      // Notify about all errors
      if (entry.result.errors) {
        if (this.listener && this.listener.onOperationFailure) {
          this.listener.onOperationFailure(entry.operation, entry.result.errors);
        }
        // Notify for success otherwise
      } else if (entry.result.data) {
        if (this.listener && this.listener.onOperationSuccess) {
          this.listener.onOperationSuccess(entry.operation, entry.result.data);
        }
        this.updateIds(entry);
        this.updateObjectState(entry);
      }
      this.persist();

      if (this.queue.length === 0 && this.listener && this.listener.queueCleared) {
        this.listener.queueCleared();
      }
      this.onDequeue(entry);
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
  private updateIds(entry: OperationQueueEntry) {
    const { operation: { operationName }, optimisticResponse, result } = entry;
    if (!result || !optimisticResponse || !isClientGeneratedId(optimisticResponse[operationName].id)) {
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
  private updateObjectState(entry: OperationQueueEntry) {
    const { result, operation: { operationName } } = entry;
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
